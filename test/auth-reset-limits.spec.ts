/// <reference types="jest" />
import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailsService } from '../src/emails/emails.service';
import { EmailOutboxService } from '../src/emails/email-outbox.service';

function setup(options: { recentToken?: boolean; validCode?: string; deleted?: boolean } = {}) {
  const user = { id: 'u1', email: 'owner@example.test', fullName: 'Tester', status: options.deleted ? 'DELETED' : 'ACTIVE', deletedAt: null, authTokenVersion: 0 };
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({ ...user, authTokenVersion: 1 }),
    },
    passwordResetToken: {
      findFirst: jest.fn(async (args: { where: { userId?: string; token?: string } }) => {
        if (args.where.userId) return options.recentToken ? { id: 'recent' } : null;
        const hash = createHash('sha256').update(options.validCode || '').digest('hex');
        return args.where.token === hash ? { id: 'reset-1', userId: user.id, user } : null;
      }),
      create: jest.fn().mockResolvedValue({ id: 'reset-1' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn(async (action: (tx: unknown) => Promise<unknown>) => action(prisma)),
  };
  const outbox = { enqueue: jest.fn().mockResolvedValue({}), cancel: jest.fn().mockResolvedValue({ count: 1 }), kick: jest.fn() };
  const auth = new AuthService(prisma as unknown as PrismaService, new JwtService(), new EmailsService(), outbox as unknown as EmailOutboxService);
  return { auth, prisma, outbox };
}

describe('password reset limits with queued delivery', () => {
  it('queues the recovery email for a normal request', async () => {
    const { auth, outbox } = setup();
    await auth.forgotPassword({ email: 'OWNER@EXAMPLE.TEST' });
    expect(outbox.enqueue).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      recipient: 'owner@example.test', kind: 'PASSWORD_RECOVERY',
      template: expect.objectContaining({ body: expect.stringMatching(/verification code is: \d{6}/) }),
    }));
  });
  it('does not queue another code within a minute and returns the same response', async () => {
    const normal = setup(), recent = setup({ recentToken: true });
    expect(await recent.auth.forgotPassword({ email: 'owner@example.test' })).toEqual(
      await normal.auth.forgotPassword({ email: 'owner@example.test' }),
    );
    expect(recent.outbox.enqueue).not.toHaveBeenCalled();
    expect(recent.prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });
  it('cancels outstanding codes after five wrong guesses and refuses the later correct code', async () => {
    const { auth, prisma, outbox } = setup({ validCode: '123456' });
    for (let i = 0; i < 5; i++) {
      await expect(auth.resetPassword({ email: 'owner@example.test', code: '000000', password: 'newpass1' }))
        .rejects.toBeInstanceOf(BadRequestException);
    }
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    expect(outbox.cancel).toHaveBeenCalledWith(expect.any(Object), 'u1', 'PASSWORD_RECOVERY');
    await expect(auth.resetPassword({ email: 'owner@example.test', code: '123456', password: 'newpass1' }))
      .rejects.toThrow('Too many incorrect codes');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
  it('accepts the correct code and queues a password-change email', async () => {
    const { auth, outbox } = setup({ validCode: '123456' });
    await expect(auth.resetPassword({ email: 'owner@example.test', code: '123456', password: 'newpass1' }))
      .resolves.toMatchObject({ success: true, emailDelivery: 'queued' });
    expect(outbox.enqueue).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ kind: 'PASSWORD_CHANGED', recipient: 'owner@example.test' }));
  });
  it('ignores previously deleted accounts without revealing their status', async () => {
    const { auth, outbox } = setup({ deleted: true });
    expect(await auth.forgotPassword({ email: 'owner@example.test' })).toMatchObject({ success: true });
    expect(outbox.enqueue).not.toHaveBeenCalled();
  });
});
