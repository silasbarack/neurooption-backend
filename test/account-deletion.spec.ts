/// <reference types="jest" />
import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AccountDeletionService, maskEmail } from '../src/account/account-deletion.service';
import { EmailsService } from '../src/emails/emails.service';

const PASSWORD = 'correct horse';

type State = {
  user: any;
  wallets: any[];
  engineWallets: any[];
  engineTrades: number;
  trades: number;
  withdrawals: number;
  deposits: number;
};

function setup(overrides: Partial<State> = {}) {
  const state: State = {
    user: {
      id: 'user-1',
      email: 'silas@example.com',
      fullName: 'Silas Barack',
      phone: '254700000000',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      passwordHash: bcrypt.hashSync(PASSWORD, 4),
    },
    wallets: [{ balance: 0, locked: 0 }],
    engineWallets: [{ balance: 0, locked: 0 }],
    engineTrades: 0,
    trades: 0,
    withdrawals: 0,
    deposits: 0,
    ...overrides,
  };

  const writes: Record<string, any[]> = { user: [], tokens: [], follows: [], affiliate: [], audit: [] };
  const prisma: any = {
    user: {
      findUnique: jest.fn(async () => (state.user ? { ...state.user } : null)),
      updateMany: jest.fn(async ({ where, data }: any) => {
        if (state.user.status === 'DELETED' && where.status?.not === 'DELETED') return { count: 0 };
        writes.user.push(data);
        state.user = { ...state.user, ...data };
        return { count: 1 };
      }),
    },
    wallet: { findMany: jest.fn(async () => state.wallets) },
    engineWallet: { findMany: jest.fn(async () => state.engineWallets) },
    engineTrade: { count: jest.fn(async () => state.engineTrades) },
    trade: { count: jest.fn(async () => state.trades) },
    withdrawal: { count: jest.fn(async () => state.withdrawals) },
    deposit: { count: jest.fn(async () => state.deposits) },
    passwordResetToken: { deleteMany: jest.fn(async (a: any) => writes.tokens.push(a)) },
    socialFollow: { updateMany: jest.fn(async (a: any) => writes.follows.push(a)) },
    affiliate: { updateMany: jest.fn(async (a: any) => writes.affiliate.push(a)) },
    auditLog: {
      create: jest.fn(async ({ data }: any) => {
        writes.audit.push(data);
        return { id: 'abcdef12-0000-0000-0000-000000000000', ...data };
      }),
      update: jest.fn(async ({ data }: any) => {
        writes.audit.push(data);
        return {};
      }),
    },
    $transaction: jest.fn(async (fn: any) => fn(prisma)),
  };

  const emails = { sendAccountDeletionEmail: jest.fn(async () => true) };
  const service = new AccountDeletionService(prisma, emails as unknown as EmailsService);
  return { service, prisma, emails, writes, state };
}

const dto = (extra: Record<string, unknown> = {}) => ({
  password: PASSWORD,
  confirmation: 'DELETE',
  ...extra,
});

describe('account deletion: what stands in the way', () => {
  it('offers suggested reasons and lets an empty account go', async () => {
    const { service } = setup();
    const check = await service.check('user-1');
    expect(check.canDelete).toBe(true);
    expect(check.blockers).toEqual([]);
    expect(check.reasons.length).toBeGreaterThanOrEqual(8);
    expect(check.reasons.map((r) => r.code)).toContain('OTHER');
    expect(check.emailHint).toBe('s***@example.com');
  });

  it.each([
    ['funds in the real wallet', { wallets: [{ balance: 1500.5, locked: 0 }] }, 'FUNDS'],
    ['funds in real trading', { engineWallets: [{ balance: 20, locked: 0 }] }, 'FUNDS'],
    ['reserved funds', { wallets: [{ balance: 0, locked: 300 }] }, 'LOCKED_FUNDS'],
    ['an open trade', { engineTrades: 2 }, 'OPEN_TRADES'],
    ['an open legacy trade', { trades: 1 }, 'OPEN_TRADES'],
    ['a pending withdrawal', { withdrawals: 1 }, 'PENDING_WITHDRAWAL'],
    ['a pending deposit', { deposits: 1 }, 'PENDING_DEPOSIT'],
    ['a staff account', { user: { id: 'user-1', email: 'a@b.c', fullName: 'A', role: 'ADMIN', status: 'ACTIVE', createdAt: new Date(), passwordHash: 'x' } }, 'STAFF_ACCOUNT'],
  ])('is blocked by %s', async (_label, overrides, code) => {
    const { service } = setup(overrides as Partial<State>);
    const check = await service.check('user-1');
    expect(check.canDelete).toBe(false);
    expect(check.blockers.map((b) => b.code)).toContain(code);
  });

  it('treats sub-cent dust as empty', async () => {
    const { service } = setup({ wallets: [{ balance: 0.004, locked: 0 }] });
    expect((await service.check('user-1')).canDelete).toBe(true);
  });

  it('points to where each blocker can be fixed', async () => {
    const { service } = setup({ wallets: [{ balance: 50, locked: 0 }], engineTrades: 1 });
    const { blockers } = await service.check('user-1');
    expect(blockers.find((b) => b.code === 'FUNDS')?.action?.path).toContain('withdraw');
    expect(blockers.find((b) => b.code === 'OPEN_TRADES')?.action?.path).toBe('/open-trades');
  });
});

describe('account deletion: confirmation and security', () => {
  it('needs the typed word', async () => {
    const { service, prisma } = setup();
    await expect(service.deleteAccount('user-1', dto({ confirmation: 'yes please' }))).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('accepts the word in any letter case', async () => {
    const { service } = setup();
    await expect(service.deleteAccount('user-1', dto({ confirmation: ' delete ' }))).resolves.toMatchObject({ success: true });
  });

  it('rejects a wrong password and changes nothing', async () => {
    const { service, prisma, emails } = setup();
    await expect(service.deleteAccount('user-1', dto({ password: 'nope' }))).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
    expect(emails.sendAccountDeletionEmail).not.toHaveBeenCalled();
  });

  it('locks out repeated wrong passwords, even a later correct one', async () => {
    const { service } = setup();
    for (let i = 0; i < 5; i += 1) {
      await expect(service.deleteAccount('user-1', dto({ password: 'bad' }))).rejects.toBeInstanceOf(UnauthorizedException);
    }
    const locked = service.deleteAccount('user-1', dto());
    await expect(locked).rejects.toBeInstanceOf(HttpException);
    await locked.catch((e: HttpException) => expect(e.getStatus()).toBe(429));
  });

  it('refuses, with the reasons, when money or trades remain', async () => {
    const { service, prisma } = setup({ wallets: [{ balance: 100, locked: 0 }], engineTrades: 1 });
    const attempt = service.deleteAccount('user-1', dto());
    await expect(attempt).rejects.toBeInstanceOf(ConflictException);
    await attempt.catch((e: ConflictException) => {
      const body = e.getResponse() as any;
      expect(body.code).toBe('ACCOUNT_DELETION_BLOCKED');
      expect(body.blockers.map((b: any) => b.code)).toEqual(expect.arrayContaining(['FUNDS', 'OPEN_TRADES']));
    });
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('cannot delete an account that is already deleted', async () => {
    const { service, state } = setup();
    state.user.status = 'DELETED';
    await expect(service.deleteAccount('user-1', dto())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('a double submit closes the account once and sends one email', async () => {
    const { service, emails } = setup();
    const results = await Promise.allSettled([
      service.deleteAccount('user-1', dto()),
      service.deleteAccount('user-1', dto()),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(emails.sendAccountDeletionEmail).toHaveBeenCalledTimes(1);
  });
});

describe('account deletion: what happens', () => {
  it('removes personal details, keeps the row, and records it', async () => {
    const { service, writes } = setup();
    await service.deleteAccount('user-1', dto({ reason: 'SWITCHING', comment: ' found a better fit ' }), {
      ipAddress: '10.0.0.1',
      userAgent: 'jest',
    });

    const patch = writes.user[0];
    expect(patch.status).toBe('DELETED');
    expect(patch.email).toBe('deleted-user-1@deleted.neurooption.invalid');
    expect(patch.fullName).toBe('Deleted user');
    expect(patch.phone).toBeNull();
    expect(patch.referralCode).toBeNull();
    // The old password no longer works.
    expect(await bcrypt.compare(PASSWORD, patch.passwordHash)).toBe(false);

    expect(writes.tokens).toHaveLength(1);
    expect(writes.follows[0].data.status).toBe('STOPPED');
    expect(writes.affiliate[0].data.status).toBe('DISABLED');

    const audit = writes.audit[0];
    expect(audit).toMatchObject({
      userId: 'user-1',
      action: 'ACCOUNT_DELETED',
      targetType: 'User',
      ipAddress: '10.0.0.1',
    });
    expect(audit.metadata).toMatchObject({ reason: 'SWITCHING', comment: 'found a better fit' });
  });

  it('emails the ORIGINAL address with full details, and says so', async () => {
    const { service, emails } = setup();
    const result = await service.deleteAccount('user-1', dto({ reason: 'BREAK' }));

    expect(result).toMatchObject({
      success: true,
      reference: 'DEL-ABCDEF12',
      emailSent: true,
      emailHint: 's***@example.com',
    });
    const sent = (emails.sendAccountDeletionEmail.mock.calls as any[][])[0][0];
    expect(sent.email).toBe('silas@example.com');
    expect(sent.fullName).toBe('Silas Barack');
    expect(sent.reference).toBe('DEL-ABCDEF12');
    expect(sent.reasonLabel).toBe("I'm taking a break and may come back");
    expect(sent.deletedAt).toBeInstanceOf(Date);
  });

  it('still deletes, and reports it honestly, when the email cannot be sent', async () => {
    const { service, emails, state } = setup();
    emails.sendAccountDeletionEmail.mockResolvedValueOnce(false);
    const result = await service.deleteAccount('user-1', dto());
    expect(result.emailSent).toBe(false);
    expect(state.user.status).toBe('DELETED');

    const { service: service2, emails: emails2, state: state2 } = setup();
    emails2.sendAccountDeletionEmail.mockRejectedValueOnce(new Error('smtp down'));
    await expect(service2.deleteAccount('user-1', dto())).resolves.toMatchObject({ success: true, emailSent: false });
    expect(state2.user.status).toBe('DELETED');
  });

  it('fails the request if recording the deletion fails', async () => {
    const { service, prisma } = setup();
    prisma.$transaction.mockImplementationOnce(async (fn: any) => {
      prisma.auditLog.create.mockRejectedValueOnce(new Error('db down'));
      return fn(prisma);
    });
    await expect(service.deleteAccount('user-1', dto())).rejects.toThrow('db down');
  });
});

describe('maskEmail', () => {
  it('hides all but the first letter', () => {
    expect(maskEmail('silasbarack5@gmail.com')).toBe('s***@gmail.com');
    expect(maskEmail('weird')).toBe('***');
  });
});

describe('deletion email', () => {
  const emails = new EmailsService();
  const when = new Date('2026-10-09T11:05:09Z'); // 14:05:09 in Kenya

  it('contains every detail the person needs, in HTML and plain text', () => {
    const t = emails.accountDeletionConfirmed({
      email: 'silas@example.com',
      fullName: 'Silas Barack',
      reference: 'DEL-ABCDEF12',
      deletedAt: when,
      reasonLabel: 'I want to stop trading to protect my finances',
    });

    expect(t.subject).toBe('Your NeuroOption account has been deleted');
    for (const text of [t.body, t.html as string]) {
      expect(text).toContain('DEL-ABCDEF12');
      expect(text).toContain('silas@example.com');
      expect(text).toContain('9 October 2026');
      expect(text).toContain('14:05:09');
      expect(text).toContain('EAT (UTC+3)');
      expect(text).toContain('2026-10-09T11:05:09.000Z');
      expect(text).toContain('I want to stop trading to protect my finances');
      expect(text).toMatch(/signed out/);
      expect(text).toMatch(/anti-money-laundering/);
      expect(text).toMatch(/never used for marketing/);
      expect(text).toMatch(/same email address/);
      expect(text).toMatch(/Contact Support/);
    }
  });

  it('leaves out the reason row when none was given, and escapes names', () => {
    const t = emails.accountDeletionConfirmed({
      email: 'a@b.com',
      fullName: '<script>alert(1)</script>',
      reference: 'DEL-1',
      deletedAt: when,
    });
    expect(t.body).not.toContain('Reason you gave');
    expect(t.html).not.toContain('Reason you gave');
    expect(t.html).not.toContain('<script>');
  });
});
