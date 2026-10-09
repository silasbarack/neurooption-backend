import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { EmailOutboxService } from '../emails/email-outbox.service';
import { serializableTransaction } from '../common/serializable-transaction';
import { lockActiveUser } from '../common/lock-active-user';
import { publicUser } from '../users/public-user';

type RegisterPayload = { fullName?: string; name?: string; email: string; password: string };
type LoginPayload = { email: string; password: string };
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { email: string; code: string; password: string };

const RESET_REQUEST_COOLDOWN_MS = 60_000;
const RESET_ATTEMPT_WINDOW_MS = 15 * 60_000;
const MAX_RESET_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
    private readonly outbox: EmailOutboxService,
  ) {}

  private normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
  private getUserDisplayName(user: User): string { return user.fullName || user.email.split('@')[0] || 'Trader'; }
  private signToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email, tokenVersion: user.authTokenVersion });
  }

  // A six-digit code has only a million possibilities, so wrong guesses are
  // limited per email: after MAX_RESET_ATTEMPTS the outstanding codes are
  // cancelled and a new one must be requested.
  private readonly resetAttempts = new Map<string, { count: number; since: number }>();

  private isResetLocked(email: string): boolean {
    const entry = this.resetAttempts.get(email);
    if (!entry) return false;
    if (Date.now() - entry.since > RESET_ATTEMPT_WINDOW_MS) {
      this.resetAttempts.delete(email);
      return false;
    }
    return entry.count >= MAX_RESET_ATTEMPTS;
  }

  private async recordFailedResetAttempt(email: string): Promise<void> {
    const now = Date.now();
    const current = this.resetAttempts.get(email);
    const entry =
      current && now - current.since <= RESET_ATTEMPT_WINDOW_MS
        ? current
        : { count: 0, since: now };
    entry.count += 1;
    this.resetAttempts.set(email, entry);

    if (this.resetAttempts.size > 5000) {
      for (const [key, value] of this.resetAttempts) {
        if (now - value.since > RESET_ATTEMPT_WINDOW_MS) this.resetAttempts.delete(key);
      }
    }

    if (entry.count >= MAX_RESET_ATTEMPTS) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user && !user.deletedAt && user.status !== 'DELETED') {
        await serializableTransaction(this.prisma, async (tx) => {
          await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
          await this.outbox.cancel(tx, user.id, 'PASSWORD_RECOVERY');
        });
      }
    }
  }

  async register(payload: RegisterPayload) {
    const email = this.normalizeEmail(payload.email || '');
    const fullName = (payload.fullName || payload.name || '').trim();
    if (!email || !payload.password) throw new BadRequestException('Email and password are required.');
    if (payload.password.length < 6) throw new BadRequestException('Password must be at least 6 characters.');
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new BadRequestException('An account with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await serializableTransaction(this.prisma, async (tx) => {
      const created = await tx.user.create({ data: { email, fullName, passwordHash } });
      await this.outbox.enqueue(tx, {
        userId: created.id, kind: 'ACCOUNT_CREATED', deduplicationKey: 'welcome:' + created.id,
        recipient: created.email,
        template: this.emailsService.accountCreated(created.email, this.getUserDisplayName(created)),
      });
      return created;
    });
    this.outbox.kick();
    const token = this.signToken(user);
    return { success: true, message: 'Account created successfully.', token, accessToken: token, user: publicUser(user), emailDelivery: 'queued' };
  }

  async login(payload: LoginPayload) {
    const email = this.normalizeEmail(payload.email || '');
    if (!email || !payload.password) throw new BadRequestException('Email and password are required.');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || user.status === 'DELETED' || !(await bcrypt.compare(payload.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const token = this.signToken(user);
    return { success: true, message: 'Signed in successfully.', token, accessToken: token, user: publicUser(user) };
  }

  async forgotPassword(payload: ForgotPasswordPayload) {
    const email = this.normalizeEmail(payload.email || '');
    if (!email) throw new BadRequestException('Email is required.');
    const response = {
      success: true,
      message: 'If an account exists for this email, a six-digit verification code will be emailed shortly.',
    };
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || user.status === 'DELETED') return response;
    const code = String(randomInt(100000, 1000000));
    const token = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await serializableTransaction(this.prisma, async (tx) => {
      const active = await tx.user.findUnique({ where: { id: user.id } });
      if (!active || active.deletedAt || active.status === 'DELETED') return;
      await lockActiveUser(tx, user.id);
      const recent = await tx.passwordResetToken.findFirst({
        where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_MS) } },
      });
      if (recent) return;
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await this.outbox.cancel(tx, user.id, 'PASSWORD_RECOVERY');
      const reset = await tx.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
      await this.outbox.enqueue(tx, {
        userId: user.id, kind: 'PASSWORD_RECOVERY', deduplicationKey: 'password-recovery:' + reset.id,
        recipient: active.email, expiresAt, resetTokenId: reset.id,
        template: this.emailsService.passwordRecoveryCode(code, this.getUserDisplayName(active)),
      });
    });
    this.outbox.kick();
    return response;
  }

  async resetPassword(payload: ResetPasswordPayload) {
    const email = this.normalizeEmail(payload.email || '');
    const code = String(payload.code || '').trim();
    if (!email || !/^\d{6}$/.test(code) || !payload.password) {
      throw new BadRequestException('Email, six-digit verification code and new password are required.');
    }
    if (payload.password.length < 6) throw new BadRequestException('Password must be at least 6 characters.');
    if (this.isResetLocked(email)) {
      throw new BadRequestException('Too many incorrect codes. Request a new verification code and try again.');
    }
    const token = createHash('sha256').update(code).digest('hex');
    const reset = await this.prisma.passwordResetToken.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() }, user: { email, deletedAt: null, status: { not: 'DELETED' } } },
      include: { user: true },
    });
    if (!reset) {
      await this.recordFailedResetAttempt(email);
      throw new BadRequestException('Invalid or expired verification code.');
    }
    const passwordHash = await bcrypt.hash(payload.password, 12);
    await serializableTransaction(this.prisma, async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, used: false, expiresAt: { gt: new Date() }, user: { deletedAt: null, status: { not: 'DELETED' } } },
        data: { used: true },
      });
      if (consumed.count !== 1) throw new BadRequestException('Invalid or expired verification code.');
      const user = await tx.user.update({
        where: { id: reset.userId, deletedAt: null, status: { not: 'DELETED' } },
        data: { passwordHash, authTokenVersion: { increment: 1 } },
      });
      await tx.passwordResetToken.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } });
      await this.outbox.cancel(tx, reset.userId, 'PASSWORD_RECOVERY');
      await this.outbox.enqueue(tx, {
        userId: user.id, kind: 'PASSWORD_CHANGED', deduplicationKey: 'password-changed:' + reset.id,
        recipient: user.email, template: this.emailsService.passwordChanged(this.getUserDisplayName(user)),
      });
    });
    this.resetAttempts.delete(email);
    this.outbox.kick();
    return { success: true, message: 'Password reset successfully.', emailDelivery: 'queued' };
  }
}
