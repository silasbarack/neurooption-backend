/// <reference types="jest" />
import { BadRequestException, ConflictException, HttpException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AccountDeletionService, maskEmail } from '../src/account/account-deletion.service';
import { PrismaService } from '../src/config/prisma.service';
import { EmailOutboxService } from '../src/emails/email-outbox.service';
import { EmailsService } from '../src/emails/emails.service';

type State = {
  wallets?: Array<{ balance: number; locked: number }>;
  engineWallets?: Array<{ balance: number; locked: number }>;
  trades?: number; engineTrades?: number; copies?: number; withdrawals?: number;
  deposits?: number; payouts?: number; commissions?: number; role?: string;
};

async function setup(state: State = {}) {
  const user = { id: 'test-user', email: 'owner@example.test', fullName: 'Tester',
    role: state.role || 'USER', status: 'ACTIVE', deletedAt: null, passwordHash: await bcrypt.hash('test-password', 4) };
  const prisma = {
    user: { findUnique: jest.fn().mockResolvedValue(user), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    wallet: { findMany: jest.fn().mockResolvedValue((state.wallets || []).map((w) => ({
      balance: new Prisma.Decimal(w.balance), locked: new Prisma.Decimal(w.locked),
    }))) },
    tradingAccount: { findMany: jest.fn().mockResolvedValue([]) },
    engineWallet: { findMany: jest.fn().mockResolvedValue((state.engineWallets || []).map((w) => ({
      balance: new Prisma.Decimal(w.balance), locked: new Prisma.Decimal(w.locked),
      balanceUsd: new Prisma.Decimal(0), lockedUsd: new Prisma.Decimal(0),
    }))) },
    trade: { count: jest.fn().mockResolvedValue(state.trades || 0) },
    engineTrade: { count: jest.fn().mockResolvedValue(state.engineTrades || 0) },
    copyTrade: { count: jest.fn().mockResolvedValue(state.copies || 0) },
    withdrawal: { count: jest.fn().mockResolvedValue(state.withdrawals || 0) },
    deposit: { count: jest.fn().mockResolvedValue(state.deposits || 0) },
    payout: { count: jest.fn().mockResolvedValue(state.payouts || 0) },
    affiliateCommission: { count: jest.fn().mockResolvedValue(state.commissions || 0) },
    transaction: { count: jest.fn().mockResolvedValue(0) },
    engineTransaction: { count: jest.fn().mockResolvedValue(0) },
    ledgerEntry: { groupBy: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn(async (action: (tx: unknown) => Promise<unknown>) => action(prisma)),
  };
  const outbox = { enqueue: jest.fn(), cancel: jest.fn(), kick: jest.fn() };
  return {
    service: new AccountDeletionService(prisma as unknown as PrismaService, new EmailsService(), outbox as unknown as EmailOutboxService),
    prisma, outbox,
  };
}

describe('account deletion options and confirmation', () => {
  it('offers suggested reasons and a masked email for an empty account', async () => {
    const { service } = await setup();
    const check = await service.check('test-user');
    expect(check.canDelete).toBe(true);
    expect(check.reasons.length).toBeGreaterThanOrEqual(8);
    expect(check.reasons.map((reason) => reason.code)).toContain('OTHER');
    expect(check.emailHint).toBe('o***@example.test');
    expect(check.confirmationWord).toBe('DELETE');
  });

  it.each([
    ['real wallet funds', { wallets: [{ balance: 10, locked: 0 }] }, 'FUNDS'],
    ['funds below one cent', { wallets: [{ balance: 0.004, locked: 0 }] }, 'FUNDS'],
    ['reserved funds', { wallets: [{ balance: 0, locked: 1 }] }, 'LOCKED_FUNDS'],
    ['real engine funds', { engineWallets: [{ balance: 2, locked: 0 }] }, 'FUNDS'],
    ['an open trade', { trades: 1 }, 'OPEN_TRADES'],
    ['an open engine trade', { engineTrades: 1 }, 'OPEN_TRADES'],
    ['an open copy trade', { copies: 1 }, 'OPEN_TRADES'],
    ['a pending withdrawal', { withdrawals: 1 }, 'PENDING_WITHDRAWAL'],
    ['a pending deposit', { deposits: 1 }, 'PENDING_DEPOSIT'],
    ['a pending payout', { payouts: 1 }, 'PENDING_PAYOUT'],
    ['an unpaid commission', { commissions: 1 }, 'UNPAID_COMMISSION'],
    ['a staff account', { role: 'ADMIN' }, 'STAFF_ACCOUNT'],
  ] as const)('shows a blocker for %s', async (_name, state, code) => {
    const { service } = await setup(state as State);
    const check = await service.check('test-user');
    expect(check.canDelete).toBe(false);
    expect(check.blockers.map((blocker) => blocker.code)).toContain(code);
  });

  it('requires the exact word instead of accepting lowercase or surrounding spaces', async () => {
    const { service, prisma } = await setup();
    for (const confirmation of ['delete', ' DELETE ', 'yes please']) {
      await expect(service.deleteAccount('test-user', { password: 'test-password', confirmation }))
        .rejects.toBeInstanceOf(BadRequestException);
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a wrong password without persisting or emailing deletion', async () => {
    const { service, prisma, outbox } = await setup();
    await expect(service.deleteAccount('test-user', { password: 'wrong', confirmation: 'DELETE' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('preserves the five-failure password lockout', async () => {
    const { service } = await setup();
    for (let i = 0; i < 5; i++) {
      await expect(service.deleteAccount('test-user', { password: 'wrong', confirmation: 'DELETE' }))
        .rejects.toBeInstanceOf(UnauthorizedException);
    }
    const attempt = service.deleteAccount('test-user', { password: 'test-password', confirmation: 'DELETE' });
    await expect(attempt).rejects.toBeInstanceOf(HttpException);
    await attempt.catch((error: HttpException) => expect(error.getStatus()).toBe(429));
  });

  it('rechecks blockers inside the closure transaction and does not queue deletion', async () => {
    const { service, outbox } = await setup({ wallets: [{ balance: 5, locked: 0 }] });
    const attempt = service.deleteAccount('test-user', { password: 'test-password', confirmation: 'DELETE' });
    await expect(attempt).rejects.toBeInstanceOf(ConflictException);
    await attempt.catch((error: ConflictException) => expect(error.getResponse()).toMatchObject({
      code: 'ACCOUNT_DELETION_BLOCKED', blockers: expect.arrayContaining([expect.objectContaining({ code: 'FUNDS' })]),
    }));
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });

  it('masks the email address', () => {
    expect(maskEmail('trader@example.test')).toBe('t***@example.test');
    expect(maskEmail('invalid')).toBe('***');
  });
});
