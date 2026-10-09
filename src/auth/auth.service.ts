import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { EmailOutboxService } from '../emails/email-outbox.service';
import { serializableTransaction } from '../common/serializable-transaction';
import { publicUser } from '../users/public-user';

type RegisterPayload = { fullName?: string; name?: string; email: string; password: string };
type LoginPayload = { email: string; password: string };
type ForgotPasswordPayload = { email: string };
type ResetPasswordPayload = { email: string; code: string; password: string };

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
    if (!user || user.deletedAt || !(await bcrypt.compare(payload.password, user.passwordHash))) {
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
    if (!user || user.deletedAt) return response;
    const code = String(randomInt(100000, 1000000));
    const token = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await serializableTransaction(this.prisma, async (tx) => {
      const active = await tx.user.findUnique({ where: { id: user.id } });
      if (!active || active.deletedAt) return;
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
    const token = createHash('sha256').update(code).digest('hex');
    const reset = await this.prisma.passwordResetToken.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() }, user: { email, deletedAt: null } },
      include: { user: true },
    });
    if (!reset) throw new BadRequestException('Invalid or expired verification code.');
    const passwordHash = await bcrypt.hash(payload.password, 12);
    await serializableTransaction(this.prisma, async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: reset.id, used: false, expiresAt: { gt: new Date() }, user: { deletedAt: null } },
        data: { used: true },
      });
      if (consumed.count !== 1) throw new BadRequestException('Invalid or expired verification code.');
      const user = await tx.user.update({
        where: { id: reset.userId, deletedAt: null },
        data: { passwordHash, authTokenVersion: { increment: 1 } },
      });
      await tx.passwordResetToken.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } });
      await this.outbox.cancel(tx, reset.userId, 'PASSWORD_RECOVERY');
      await this.outbox.enqueue(tx, {
        userId: user.id, kind: 'PASSWORD_CHANGED', deduplicationKey: 'password-changed:' + reset.id,
        recipient: user.email, template: this.emailsService.passwordChanged(this.getUserDisplayName(user)),
      });
    });
    this.outbox.kick();
    return { success: true, message: 'Password reset successfully.', emailDelivery: 'queued' };
  }
}
