/// <reference types="jest" />
import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';

import { AuthService } from '../src/auth/auth.service';

function setup(overrides: { recentToken?: boolean; validCode?: string } = {}) {
  const user = { id: 'u1', email: 'a@b.com', fullName: 'A', status: 'ACTIVE' };
  const prisma: any = {
    user: { findUnique: jest.fn(async () => user), update: jest.fn() },
    passwordResetToken: {
      findFirst: jest.fn(async (args: any) => {
        if (args.where.userId) return overrides.recentToken ? { id: 'recent' } : null; // cooldown lookup
        const hash = createHash('sha256').update(overrides.validCode ?? '').digest('hex');
        return args.where.token === hash ? { id: 't1', userId: 'u1', user } : null;
      }),
      deleteMany: jest.fn(async () => ({ count: 1 })),
      create: jest.fn(async () => ({})),
      update: jest.fn(async () => ({})),
    },
  };
  const emails = {
    sendPasswordRecoveryCodeEmail: jest.fn(async () => true),
    sendPasswordChangedEmail: jest.fn(async () => true),
  };
  const auth = new AuthService(prisma, { sign: () => 't' } as any, emails as any, {} as any);
  return { auth, prisma, emails };
}

describe('password reset limits', () => {
  it('sends the code email for a normal request', async () => {
    const { auth, emails } = setup();
    await auth.forgotPassword({ email: 'A@B.com' });
    expect(emails.sendPasswordRecoveryCodeEmail).toHaveBeenCalledWith('a@b.com', expect.stringMatching(/^\d{6}$/), 'A');
  });

  it('does not send a second code within a minute, and answers the same way', async () => {
    const { auth, emails, prisma } = setup({ recentToken: true });
    const result = await auth.forgotPassword({ email: 'a@b.com' });
    expect(result.success).toBe(true);
    expect(emails.sendPasswordRecoveryCodeEmail).not.toHaveBeenCalled();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it('cancels the code after five wrong guesses, so it cannot be brute-forced', async () => {
    const { auth, prisma } = setup({ validCode: '123456' });
    for (let i = 0; i < 5; i += 1) {
      await expect(auth.resetPassword({ email: 'a@b.com', code: '000000', password: 'newpass1' })).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });

    // Even the right code is refused until a new one is requested.
    const late = auth.resetPassword({ email: 'a@b.com', code: '123456', password: 'newpass1' });
    await expect(late).rejects.toThrow(/Too many incorrect codes/);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('accepts the right code and sends the "password changed" email', async () => {
    const { auth, prisma, emails } = setup({ validCode: '123456' });
    await expect(auth.resetPassword({ email: 'a@b.com', code: '123456', password: 'newpass1' })).resolves.toMatchObject({ success: true });
    expect(prisma.user.update).toHaveBeenCalled();
    expect(emails.sendPasswordChangedEmail).toHaveBeenCalledWith('a@b.com', 'A');
  });

  it('ignores deleted accounts without revealing anything', async () => {
    const { auth, prisma, emails } = setup();
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'x', status: 'DELETED' });
    await expect(auth.forgotPassword({ email: 'x@y.com' })).resolves.toMatchObject({ success: true });
    expect(emails.sendPasswordRecoveryCodeEmail).not.toHaveBeenCalled();
  });
});
