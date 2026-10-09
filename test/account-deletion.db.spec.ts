/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AccountDeletionService } from '../src/account/account-deletion.service';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { PrismaService } from '../src/config/prisma.service';
import { EmailOutboxService } from '../src/emails/email-outbox.service';
import { EmailsService } from '../src/emails/emails.service';

/** Runs against PostgreSQL (DATABASE_URL), like the other database tests. */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('account deletion with PostgreSQL', () => {
  const prisma = new PrismaClient();
  const sent: any[] = [];
  const emails = new EmailsService();
  jest.spyOn(emails, 'sendTemplateEmail').mockImplementation(async (email, template) => {
    sent.push({ email, template }); return true;
  });
  const outbox = new EmailOutboxService(prisma as unknown as PrismaService, emails);
  jest.spyOn(outbox, 'kick').mockImplementation(() => undefined);
  const service = new AccountDeletionService(prisma as unknown as PrismaService, emails, outbox);
  const created: string[] = [];

  async function newUser(label: string) {
    const email = `del-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.example`;
    const user = await prisma.user.create({
      data: {
        email,
        fullName: `Tester ${label}`,
        phone: `2547${Math.floor(Math.random() * 1e8).toString().padStart(8, '0')}`,
        passwordHash: await bcrypt.hash('pw-123456', 4),
      },
    });
    created.push(user.id);
    return user;
  }

  afterAll(async () => {
    const scope = { userId: { in: created } };
    await prisma.emailOutbox.deleteMany({ where: scope });
    await prisma.passwordResetToken.deleteMany({ where: scope });
    await prisma.engineTrade.deleteMany({ where: scope });
    await prisma.auditLog.deleteMany({ where: scope });
    await prisma.wallet.deleteMany({ where: scope });
    await prisma.user.deleteMany({ where: { id: { in: created } } });
    jest.restoreAllMocks();
    await prisma.$disconnect();
  });

  it('refuses while real money or an open trade remains, and changes nothing', async () => {
    const user = await newUser('blocked');
    await prisma.wallet.create({ data: { userId: user.id, currency: 'KES', balance: 250 } });

    await expect(
      service.deleteAccount(user.id, { password: 'pw-123456', confirmation: 'DELETE' }),
    ).rejects.toMatchObject({ response: { code: 'ACCOUNT_DELETION_BLOCKED' } });

    const after = await prisma.user.findUnique({ where: { id: user.id } });
    expect(after?.status).not.toBe('DELETED');
    expect(after?.email).toBe(user.email);

    await prisma.wallet.updateMany({ where: { userId: user.id }, data: { balance: 0 } });
    await prisma.engineTrade.create({
      data: {
        userId: user.id, asset: 'EUR/USD OTC', side: 'BUY', status: 'PENDING', stakeAmount: 1, stakeUsd: 1,
        payoutPercent: 87, expectedProfitAmount: 1, expectedProfitUsd: 1, expectedReturnAmount: 2,
        expectedReturnUsd: 2, entryPrice: 1, entryTime: new Date(), expiryTime: new Date(Date.now() + 60_000), expirySeconds: 60,
      },
    });
    const check = await service.check(user.id);
    expect(check.blockers.map((b) => b.code)).toEqual(['OPEN_TRADES']);
  });

  it('closes an empty account: anonymised row kept, old tokens and logins dead, audit written, email address freed', async () => {
    const user = await newUser('ok');
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: `tok-${user.id}`, expiresAt: new Date(Date.now() + 600_000) },
    });
    // History that must survive: a completed withdrawal record and a settled trade.
    await prisma.wallet.create({ data: { userId: user.id, currency: 'KES', balance: 0 } });
    await prisma.engineTrade.create({
      data: {
        userId: user.id, asset: 'EUR/USD OTC', side: 'BUY', status: 'WON', stakeAmount: 1, stakeUsd: 1,
        payoutPercent: 87, expectedProfitAmount: 1, expectedProfitUsd: 1, expectedReturnAmount: 2,
        expectedReturnUsd: 2, entryPrice: 1, entryTime: new Date(), expiryTime: new Date(), expirySeconds: 60,
      },
    });

    const result = await service.deleteAccount(
      user.id,
      { password: 'pw-123456', confirmation: 'DELETE', reason: 'NOT_TRADING', comment: 'bye' },
      { ipAddress: '10.1.1.1', userAgent: 'jest' },
    );

    expect(result).toMatchObject({ success: true, emailSent: false, emailDelivery: 'queued' });
    await outbox.processPending();
    expect(result.reference).toMatch(/^DEL-[0-9A-F-]{36}$/);
    expect(sent.at(-1)).toMatchObject({ email: user.email, template: { body: expect.stringContaining(result.reference) } });

    const row = await prisma.user.findUnique({ where: { id: user.id } });
    expect(row).toMatchObject({ status: 'DELETED', fullName: 'Deleted user', phone: null, referralCode: null });
    expect(row?.email).toContain('@deleted.neurooption.invalid');
    expect(await bcrypt.compare('pw-123456', row!.passwordHash)).toBe(false);

    expect(await prisma.passwordResetToken.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.engineTrade.count({ where: { userId: user.id } })).toBe(1); // history kept
    const audit = await prisma.auditLog.findFirst({ where: { userId: user.id, action: 'ACCOUNT_DELETED' } });
    expect(audit).toMatchObject({ targetId: user.id, ipAddress: '10.1.1.1' });
    expect((audit!.metadata as any).reason).toBe('NOT_TRADING');
    expect((audit!.metadata as any).emailDelivery).toBe('queued');

    // Existing tokens stop working at once; the account cannot sign in.
    const strategy = new JwtStrategy(prisma as any);
    await expect(strategy.validate({ sub: user.id })).rejects.toThrow('Invalid token');
    const auth = new AuthService(prisma as any, { sign: () => 't' } as any, {} as any, {} as any);
    await expect(auth.login({ email: user.email, password: 'pw-123456' })).rejects.toThrow('Invalid email or password.');
    await expect(auth.login({ email: row!.email, password: 'pw-123456' })).rejects.toThrow('Invalid email or password.');

    // The email address can be registered again, as a brand-new account.
    const again = await prisma.user.create({
      data: { email: user.email, fullName: 'Back again', passwordHash: 'x' },
    });
    created.push(again.id);
    expect(again.id).not.toBe(user.id);

    // And a second delete of the closed account is refused.
    await expect(
      service.deleteAccount(user.id, { password: 'pw-123456', confirmation: 'DELETE' }),
    ).rejects.toThrow('Account not found.');
  });

  it('rolls the whole deletion back if any step fails', async () => {
    const user = await newUser('rollback');
    const original = prisma.$transaction.bind(prisma) as any;
    const spy = jest.spyOn(prisma, '$transaction').mockImplementation(((fn: any) =>
      original(async (tx: any) =>
        fn(
          new Proxy(tx, {
            get: (target, key) =>
              key === 'auditLog'
                ? { ...target.auditLog, create: () => { throw new Error('audit write failed'); } }
                : target[key],
          }),
        ),
      )) as any);

    await expect(
      service.deleteAccount(user.id, { password: 'pw-123456', confirmation: 'DELETE' }),
    ).rejects.toThrow('audit write failed');
    spy.mockRestore();

    const row = await prisma.user.findUnique({ where: { id: user.id } });
    expect(row).toMatchObject({ email: user.email, fullName: user.fullName });
    expect(row?.status).not.toBe('DELETED');
  });
});
