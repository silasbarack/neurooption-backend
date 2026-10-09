/// <reference types="jest" />
import { ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../src/config/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { UsersService } from '../src/users/users.service';
import { ProfileService } from '../src/profile/profile.service';
import { EmailsService } from '../src/emails/emails.service';
import { EmailOutboxService } from '../src/emails/email-outbox.service';
import { AffiliatesService } from '../src/affiliates/affiliates.service';
import { SocialTradingService } from '../src/social-trading/social-trading.service';
import { LedgerService } from '../src/ledger/ledger.service';
import { lockActiveUser } from '../src/common/lock-active-user';
import { DELETE_ACCOUNT_CONFIRMATION } from '../src/users/dto/delete-account.dto';

const describeDb = process.env.DATABASE_URL ? describe : describe.skip;
const password = 'synthetic-current-password';
const deletion = { confirmation: DELETE_ACCOUNT_CONFIRMATION, currentPassword: password, reason: 'NO_LONGER_USE' as const };

describeDb('account lifecycle with PostgreSQL', () => {
  const prisma = new PrismaService();
  const emails = new EmailsService();
  const outbox = new EmailOutboxService(prisma, emails);
  const jwt = new JwtService({ secret: process.env.JWT_SECRET || 'dev_secret' });
  const auth = new AuthService(prisma, jwt, emails, outbox);
  const users = new UsersService(prisma, emails, outbox);
  const profile = new ProfileService(prisma);
  const userIds: string[] = [];
  const assetIds: string[] = [];
  let userId: string;
  let address: string;
  let send: jest.SpyInstance;
  let passwordHash: string;

  async function fixtureUser() {
    const id = randomUUID();
    userIds.push(id);
    return prisma.user.create({
      data: { id, email: 'lifecycle-' + id + '@example.test', fullName: 'Lifecycle tester', passwordHash },
    });
  }

  async function recoveryCode() {
    await auth.forgotPassword({ email: address });
    const job = await prisma.emailOutbox.findFirstOrThrow({
      where: { userId, kind: 'PASSWORD_RECOVERY', status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    const code = job.body?.match(/verification code is: (\d{6})/)?.[1];
    if (!code) throw new Error('Recovery email is missing its code');
    return { code, job };
  }

  async function affiliateFixture(status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED' = 'PAID') {
    const referred = await fixtureUser();
    const affiliate = await prisma.affiliate.create({ data: { userId, code: 'test-' + randomUUID() } });
    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id, affiliateUserId: userId, referredUserId: referred.id,
        amount: 2, rate: 0.1, status, ...(status === 'PAID' ? { paidAt: new Date() } : {}),
      },
    });
    return { affiliate, commission, referred };
  }

  async function copyFixture(status: 'OPEN' | 'WON' = 'WON', createCopy = true) {
    const master = await fixtureUser();
    const asset = await prisma.asset.create({
      data: { symbol: 'TEST-' + randomUUID(), name: 'Synthetic asset', category: 'CURRENCY', marketType: 'OTC' },
    });
    assetIds.push(asset.id);
    const trade = await prisma.trade.create({
      data: { userId: master.id, assetId: asset.id, direction: 'BUY', status: 'WON',
        stakeAmount: 1, payoutRate: 0.8, entryPrice: 1, expiresAt: new Date(), closedAt: new Date() },
    });
    const follow = await prisma.socialFollow.create({
      data: { followerUserId: userId, traderUserId: master.id },
    });
    const copy = createCopy ? await prisma.copyTrade.create({
      data: {
        socialFollowId: follow.id, masterUserId: master.id, followerUserId: userId,
        masterTradeId: trade.id, stakeAmount: 1, payoutRate: 0.8, entryPrice: 1, status,
        ...(status !== 'OPEN' ? { closedAt: new Date() } : {}),
      },
    }) : null;
    return { master, trade, follow, copy };
  }

  beforeAll(async () => {
    await prisma.$connect();
    passwordHash = await bcrypt.hash(password, 4);
    jest.spyOn(outbox, 'kick').mockImplementation(() => undefined);
  });

  beforeEach(async () => {
    send = jest.spyOn(emails, 'sendTemplateEmail').mockResolvedValue(true);
    const user = await fixtureUser(); userId = user.id; address = user.email;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.spyOn(outbox, 'kick').mockImplementation(() => undefined);
    const scope = { userId: { in: [...userIds] } };
    await prisma.emailOutbox.deleteMany({ where: scope });
    await prisma.notification.deleteMany({ where: scope });
    await prisma.passwordResetToken.deleteMany({ where: scope });
    await prisma.payout.deleteMany({ where: scope });
    await prisma.affiliateCommission.deleteMany({ where: { OR: [
      { affiliateUserId: { in: [...userIds] } }, { referredUserId: { in: [...userIds] } },
    ] } });
    await prisma.affiliate.deleteMany({ where: scope });
    await prisma.copyTrade.deleteMany({ where: { OR: [
      { masterUserId: { in: [...userIds] } }, { followerUserId: { in: [...userIds] } },
    ] } });
    await prisma.socialFollow.deleteMany({ where: { OR: [
      { followerUserId: { in: [...userIds] } }, { traderUserId: { in: [...userIds] } },
    ] } });
    await prisma.trade.deleteMany({ where: scope });
    await prisma.engineTrade.deleteMany({ where: scope });
    await prisma.engineTransaction.deleteMany({ where: scope });
    await prisma.engineWallet.deleteMany({ where: scope });
    await prisma.deposit.deleteMany({ where: scope });
    await prisma.withdrawal.deleteMany({ where: scope });
    await prisma.transaction.deleteMany({ where: scope });
    await prisma.kycRecord.deleteMany({ where: scope });
    await prisma.ledgerAccount.deleteMany({ where: scope });
    await prisma.wallet.deleteMany({ where: scope });
    await prisma.tradingAccount.deleteMany({ where: scope });
    await prisma.auditLog.deleteMany({ where: scope });
    await prisma.user.deleteMany({ where: { id: { in: [...userIds] } } });
    await prisma.asset.deleteMany({ where: { id: { in: [...assetIds] } } });
    userIds.length = 0; assetIds.length = 0;
  });
  afterAll(async () => { await prisma.$disconnect(); });

  it('creates signup and its welcome message atomically without exposing credentials', async () => {
    const email = 'signup-' + randomUUID() + '@example.test';
    const result = await auth.register({ fullName: 'Signup tester', email, password });
    userIds.push(result.user.id);
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user).not.toHaveProperty('authTokenVersion');
    expect(result.emailDelivery).toBe('queued');
    expect(await prisma.emailOutbox.findUnique({
      where: { deduplicationKey: 'welcome:' + result.user.id },
    })).toMatchObject({ recipient: email, kind: 'ACCOUNT_CREATED', status: 'PENDING' });
  });

  it('rolls back signup when its email cannot be persisted', async () => {
    const email = 'rollback-' + randomUUID() + '@example.test';
    jest.spyOn(outbox, 'enqueue').mockRejectedValueOnce(new Error('synthetic persistence failure'));
    await expect(auth.register({ fullName: 'Rollback tester', email, password })).rejects.toThrow('synthetic persistence failure');
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });

  it('returns the same recovery response for registered and unknown addresses', async () => {
    expect(await auth.forgotPassword({ email: address })).toEqual(
      await auth.forgotPassword({ email: 'unknown-' + randomUUID() + '@example.test' }),
    );
  });

  it('invalidates superseded reset codes and cancels their queued messages', async () => {
    const first = await recoveryCode();
    const second = await recoveryCode();
    expect(await prisma.passwordResetToken.findUnique({ where: { id: first.job.resetTokenId! } })).toBeNull();
    expect(await prisma.emailOutbox.findUnique({ where: { id: first.job.id } })).toMatchObject({
      status: 'CANCELLED', recipient: null, body: null,
    });
    expect(await prisma.passwordResetToken.findUnique({ where: { id: second.job.resetTokenId! } }))
      .not.toMatchObject({ token: second.code });
  });

  it('does not send expired recovery messages', async () => {
    const { job } = await recoveryCode();
    await prisma.passwordResetToken.update({ where: { id: job.resetTokenId! }, data: { expiresAt: new Date(0) } });
    await outbox.processPending();
    expect(send).not.toHaveBeenCalled();
    expect(await prisma.emailOutbox.findUnique({ where: { id: job.id } })).toMatchObject({ status: 'CANCELLED', body: null });
  });

  it('consumes a reset code once, revokes prior JWTs and queues a password-change notice', async () => {
    const oldLogin = await auth.login({ email: address, password });
    const { code } = await recoveryCode();
    await auth.resetPassword({ email: address, code, password: 'synthetic-new-password' });
    await expect(auth.resetPassword({ email: address, code, password: 'another-password' })).rejects.toThrow('Invalid or expired');
    await expect(auth.login({ email: address, password })).rejects.toThrow('Invalid email or password');
    expect((await auth.login({ email: address, password: 'synthetic-new-password' })).token).toBeTruthy();
    await expect(new JwtStrategy(prisma).validate(jwt.decode(oldLogin.token) as { sub: string; tokenVersion: number }))
      .rejects.toThrow('Invalid token');
    const notice = await prisma.emailOutbox.findFirstOrThrow({ where: { userId, kind: 'PASSWORD_CHANGED' } });
    expect(notice.recipient).toBe(address);
    expect(notice.body).not.toContain('synthetic-new-password');
  });

  it('allows only one concurrent reset using the same code', async () => {
    const { code } = await recoveryCode();
    const results = await Promise.allSettled([
      auth.resetPassword({ email: address, code, password: 'concurrent-password-a' }),
      auth.resetPassword({ email: address, code, password: 'concurrent-password-b' }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.emailOutbox.count({ where: { userId, kind: 'PASSWORD_CHANGED' } })).toBe(1);
  });

  it('rolls back a password reset if the change notice cannot be persisted', async () => {
    const { code, job } = await recoveryCode();
    jest.spyOn(outbox, 'enqueue').mockRejectedValueOnce(new Error('synthetic persistence failure'));
    await expect(auth.resetPassword({ email: address, code, password: 'rollback-password' })).rejects.toThrow('synthetic persistence failure');
    expect(await prisma.user.findUnique({ where: { id: userId } })).toMatchObject({ passwordHash, authTokenVersion: 0 });
    expect(await prisma.passwordResetToken.findUnique({ where: { id: job.resetTokenId! } })).toMatchObject({ used: false });
    expect(await prisma.emailOutbox.findUnique({ where: { id: job.id } })).toMatchObject({ status: 'PENDING' });
  });

  it('anonymizes a settled account, retains history and emails the original address', async () => {
    const login = await auth.login({ email: address, password });
    await recoveryCode();
    const wallet = await prisma.wallet.create({ data: { userId } });
    const history = await prisma.transaction.create({
      data: { userId, walletId: wallet.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 0 },
    });
    const kyc = await prisma.kycRecord.create({ data: { userId, documentType: 'Synthetic document' } });
    const demo = await prisma.tradingAccount.create({ data: { userId, type: 'DEMO', currency: 'USD', balance: 70000 } });
    const ledger = await new LedgerService(prisma).ensureUserLedgerAccounts(userId, 'USD');
    await prisma.notification.create({
      data: { userId, type: 'ADMIN_ACTION', recipientEmail: address, subject: 'Old account notice', body: 'Old profile details' },
    });
    const receipt = await users.deleteMe(userId, deletion);
    const deleted = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(deleted).toMatchObject({ fullName: 'Deleted account', phone: null, status: 'LOCKED', authTokenVersion: 1 });
    expect(deleted.email).toContain('@deleted.neurooption.invalid');
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    expect(await bcrypt.compare(password, deleted.passwordHash)).toBe(false);
    expect(await prisma.transaction.findUnique({ where: { id: history.id } })).not.toBeNull();
    expect(await prisma.kycRecord.findUnique({ where: { id: kyc.id } })).not.toBeNull();
    expect(await prisma.tradingAccount.findUnique({ where: { id: demo.id } })).toMatchObject({ isActive: false });
    expect(await prisma.ledgerAccount.findUnique({ where: { id: ledger.available.id } })).toMatchObject({ isActive: false });
    expect(await prisma.notification.findFirst({ where: { userId } })).toMatchObject({ recipientEmail: '', body: '' });
    expect(await prisma.passwordResetToken.count({ where: { userId } })).toBe(0);
    await expect(users.getMe(userId)).rejects.toThrow('User account not found');
    await expect(profile.getProfile(userId)).rejects.toThrow('User not found');
    await expect(new LedgerService(prisma).ensureUserLedgerAccounts(userId, 'USD')).rejects.toThrow('User account not found');
    await expect(new JwtStrategy(prisma).validate(jwt.decode(login.token) as { sub: string; tokenVersion: number }))
      .rejects.toThrow('Invalid token');
    expect(receipt.notificationEmail).toBe(address);
    await outbox.processPending();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(address, expect.objectContaining({
      body: expect.stringContaining(receipt.deletionReference),
    }));
    expect(await prisma.emailOutbox.findFirst({ where: { userId, kind: 'ACCOUNT_DELETED' } })).toMatchObject({
      status: 'SENT', recipient: null, body: null, html: null,
    });
  });

  it('rolls back closure when the detailed deletion email cannot be persisted', async () => {
    const { job } = await recoveryCode();
    jest.spyOn(outbox, 'enqueue').mockRejectedValueOnce(new Error('synthetic persistence failure'));
    await expect(users.deleteMe(userId, deletion)).rejects.toThrow('synthetic persistence failure');
    expect(await prisma.user.findUnique({ where: { id: userId } })).toMatchObject({ email: address, deletedAt: null });
    expect(await prisma.emailOutbox.findUnique({ where: { id: job.id } })).toMatchObject({ status: 'PENDING' });
    expect(await prisma.passwordResetToken.count({ where: { userId } })).toBe(1);
  });

  it('blocks deletion when real money remains', async () => {
    await prisma.wallet.create({ data: { userId, balance: 1 } });
    await expect(users.deleteMe(userId, deletion)).rejects.toBeInstanceOf(ConflictException);
    expect(await prisma.user.findUnique({ where: { id: userId } })).toMatchObject({ deletedAt: null });
  });

  it('blocks deletion when an engine trade is pending', async () => {
    await prisma.engineTrade.create({
      data: { userId, asset: 'TEST', side: 'BUY', stakeAmount: 1, stakeUsd: 1,
        payoutPercent: 80, expectedProfitAmount: 0.8, expectedProfitUsd: 0.8,
        expectedReturnAmount: 1.8, expectedReturnUsd: 1.8, entryPrice: 1,
        entryTime: new Date(), expiryTime: new Date(Date.now() + 60000), expirySeconds: 60 },
    });
    await expect(users.deleteMe(userId, deletion)).rejects.toBeInstanceOf(ConflictException);
  });

  it.each(['PENDING', 'PROCESSING'] as const)('blocks a %s payout even with a completed transaction and zero wallet', async (status) => {
    const wallet = await prisma.wallet.create({ data: { userId } });
    const transaction = await prisma.transaction.create({
      data: { userId, walletId: wallet.id, type: 'DEPOSIT', status: 'COMPLETED', amount: 2 },
    });
    await prisma.payout.create({ data: { userId, walletId: wallet.id, transactionId: transaction.id, amount: 2, status } });
    await expect(users.deleteMe(userId, deletion)).rejects.toBeInstanceOf(ConflictException);
    expect(await prisma.emailOutbox.count({ where: { userId, kind: 'ACCOUNT_DELETED' } })).toBe(0);
  });

  it.each(['PENDING', 'APPROVED'] as const)('blocks an unpaid %s affiliate commission without a transaction', async (status) => {
    await affiliateFixture(status);
    await expect(users.deleteMe(userId, deletion)).rejects.toBeInstanceOf(ConflictException);
    expect(await prisma.user.findUnique({ where: { id: userId } })).toMatchObject({ deletedAt: null });
  });

  it('blocks an open copy trade whose master trade has already settled', async () => {
    const { follow } = await copyFixture('OPEN');
    await expect(users.deleteMe(userId, deletion)).rejects.toBeInstanceOf(ConflictException);
    expect(await prisma.socialFollow.findUnique({ where: { id: follow.id } })).toMatchObject({ status: 'ACTIVE' });
  });

  it('preserves settled copy and affiliate history, stops follows and disables commissions', async () => {
    const { follow, copy } = await copyFixture();
    const { affiliate, commission } = await affiliateFixture();
    await users.deleteMe(userId, deletion);
    expect(await prisma.copyTrade.findUnique({ where: { id: copy!.id } })).toMatchObject({
      socialFollowId: follow.id, status: 'WON',
    });
    expect(await prisma.socialFollow.findUnique({ where: { id: follow.id } })).toMatchObject({ status: 'STOPPED' });
    expect(await prisma.affiliate.findUnique({ where: { id: affiliate.id } })).toMatchObject({ status: 'DISABLED' });
    expect(await prisma.affiliateCommission.findUnique({ where: { id: commission.id } })).toMatchObject({ status: 'PAID' });
  });

  it('rejects commission accrual that read an active affiliate before closure', async () => {
    const { affiliate, referred } = await affiliateFixture();
    let read!: () => void; const seen = new Promise<void>((resolve) => { read = resolve; });
    let release!: () => void; const resumed = new Promise<void>((resolve) => { release = resolve; });
    const gated = {
      affiliate: { findUnique: async (args: Prisma.AffiliateFindUniqueArgs) => {
        const active = await prisma.affiliate.findUnique(args); read(); await resumed; return active;
      } },
      affiliateCommission: prisma.affiliateCommission,
      $transaction: prisma.$transaction.bind(prisma),
    } as unknown as PrismaService;
    const pending = new AffiliatesService(gated).createCommission({
      affiliateId: affiliate.id, affiliateUserId: userId, referredUserId: referred.id, amount: 10, commissionPercentage: 10,
    });
    await seen;
    try { await users.deleteMe(userId, deletion); } finally { release(); }
    await expect(pending).rejects.toBeInstanceOf(NotFoundException);
    expect(await prisma.affiliateCommission.count({ where: { affiliateUserId: userId, status: 'PENDING' } })).toBe(0);
  });

  it('rejects a copy request that read an active follow before closure', async () => {
    const { follow, master, trade } = await copyFixture('WON', false);
    let read!: () => void; const seen = new Promise<void>((resolve) => { read = resolve; });
    let release!: () => void; const resumed = new Promise<void>((resolve) => { release = resolve; });
    const gated = {
      socialFollow: {
        findUnique: async (args: Prisma.SocialFollowFindUniqueArgs) => {
          const active = await prisma.socialFollow.findUnique(args); read(); await resumed; return active;
        },
        update: prisma.socialFollow.update.bind(prisma.socialFollow),
      },
      trade: prisma.trade, $transaction: prisma.$transaction.bind(prisma),
    } as unknown as PrismaService;
    const pending = new SocialTradingService(gated).createCopyTrade({
      socialFollowId: follow.id, masterUserId: master.id, followerUserId: userId,
      masterTradeId: trade.id, stakeAmount: 1, payoutRate: 0.8, entryPrice: 1,
    });
    await seen;
    try { await users.deleteMe(userId, deletion); } finally { release(); }
    await expect(pending).rejects.toBeInstanceOf(NotFoundException);
    expect(await prisma.copyTrade.count({ where: { followerUserId: userId } })).toBe(0);
  });

  it('retries email after a worker restart and removes accepted delivery payloads', async () => {
    await auth.forgotPassword({ email: address });
    send.mockResolvedValueOnce(false);
    await outbox.processPending();
    const pending = await prisma.emailOutbox.findFirstOrThrow({ where: { userId, kind: 'PASSWORD_RECOVERY' } });
    expect(pending).toMatchObject({ status: 'PENDING', attempts: 1, recipient: address });
    const restarted = new EmailOutboxService(prisma, emails);
    await restarted.processPending();
    expect(send).toHaveBeenCalledTimes(1);
    await prisma.emailOutbox.update({ where: { id: pending.id }, data: { nextAttemptAt: new Date(0) } });
    await restarted.processPending();
    expect(send).toHaveBeenCalledTimes(2);
    expect(await prisma.emailOutbox.findUnique({ where: { id: pending.id } })).toMatchObject({
      status: 'SENT', attempts: 2, recipient: null, body: null, html: null,
    });
  });

  it('allows only one worker to claim the same message', async () => {
    await auth.forgotPassword({ email: address });
    await Promise.all([outbox.processPending(), new EmailOutboxService(prisma, emails).processPending()]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('recovers a message whose worker lease expired', async () => {
    const { job } = await recoveryCode();
    await prisma.emailOutbox.update({ where: { id: job.id }, data: {
      status: 'PROCESSING', leaseToken: 'expired-worker', lockedUntil: new Date(0),
    } });
    await outbox.processPending();
    expect(send).toHaveBeenCalledTimes(1);
    expect(await prisma.emailOutbox.findUnique({ where: { id: job.id } })).toMatchObject({ status: 'SENT' });
  });

  const concurrencyTest = process.env.RUN_PG_CONCURRENCY_TESTS === 'true' ? it : it.skip;
  concurrencyTest('retries a stale deletion snapshot after a concurrent financial write commits', async () => {
    const wallet = await prisma.wallet.create({ data: { userId } });
    let locked!: () => void; const held = new Promise<void>((resolve) => { locked = resolve; });
    let release!: () => void; const released = new Promise<void>((resolve) => { release = resolve; });
    const deposit = prisma.$transaction(async (tx) => {
      await lockActiveUser(tx, userId);
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: 1 } });
      locked(); await released;
    }, { timeout: 15000 });
    await held;
    let first = true;
    let attempts = 0;
    const coordinated = {
      user: prisma.user,
      $transaction: <T>(action: (tx: Prisma.TransactionClient) => Promise<T>, options: {
        isolationLevel?: Prisma.TransactionIsolationLevel; timeout?: number; maxWait?: number;
      }) => {
        attempts++;
        return prisma.$transaction(async (tx) => {
          if (first) {
            first = false;
            await tx.user.findUnique({ where: { id: userId } }); // Pin the older snapshot.
            release(); await deposit;
          }
          return action(tx);
        }, options);
      },
    } as unknown as PrismaService;
    try {
      await expect(new UsersService(coordinated, emails, outbox).deleteMe(userId, deletion))
        .rejects.toBeInstanceOf(ConflictException);
    } finally { release(); await deposit; }
    expect(attempts).toBeGreaterThanOrEqual(2);
    expect((await prisma.wallet.findUniqueOrThrow({ where: { id: wallet.id } })).balance.toString()).toBe('1');
    expect(await prisma.user.findUnique({ where: { id: userId } })).toMatchObject({ deletedAt: null });
    expect(await prisma.emailOutbox.count({ where: { userId, kind: 'ACCOUNT_DELETED' } })).toBe(0);
  });
});
