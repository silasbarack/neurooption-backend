import { BadRequestException, Injectable, NotFoundException, Optional, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';

export type UpdateUserPayload = {
  /** Accepted only when unchanged: email changes go through Support. */
  email?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  country?: string;
  currency?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly emails?: EmailsService,
  ) {}

  private getUserModelFields(): string[] {
    const runtimeModel = (this.prisma as any)?._runtimeDataModel?.models?.User;

    if (!runtimeModel?.fields) {
      return [];
    }

    return runtimeModel.fields.map((field: any) => field.name);
  }

  private hasUserField(fieldName: string): boolean {
    return this.getUserModelFields().includes(fieldName);
  }

  private removePassword(user: any) {
    if (!user) return null;

    const {
      password,
      passwordHash,
      hashedPassword,
      resetToken,
      resetPasswordToken,
      ...safeUser
    } = user;

    return safeUser;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      } as any,
    });

    return users.map((user) => this.removePassword(user));
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    return this.removePassword(user);
  }

  async getMe(userId: string) {
    return this.findById(userId);
  }

  async updateMe(userId: string, payload: UpdateUserPayload) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User account not found.');
    }

    // Changing the sign-in email would let a stolen session take over the
    // account (via password reset), so it is not self-service.
    if (payload.email !== undefined && payload.email.trim().toLowerCase() !== existingUser.email) {
      throw new BadRequestException('To change your email address, please contact Support.');
    }

    const data: Record<string, any> = {};

    if (this.hasUserField('fullName')) {
      data.fullName =
        payload.fullName ??
        payload.name ??
        (existingUser as any).fullName;
    }

    if (this.hasUserField('name')) {
      data.name =
        payload.name ??
        payload.fullName ??
        (existingUser as any).name;
    }

    if (this.hasUserField('phone')) {
      data.phone = payload.phone ?? (existingUser as any).phone;
    }

    if (this.hasUserField('country')) {
      data.country = payload.country ?? (existingUser as any).country;
    }

    if (this.hasUserField('currency')) {
      data.currency = payload.currency ?? (existingUser as any).currency;
    }

    if (Object.keys(data).length === 0) {
      return this.removePassword(existingUser);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: data as any,
    });

    return this.removePassword(updatedUser);
  }

  /** Self-service password change: needs the current password; emails a security notice. */
  async changePassword(userId: string, payload: { currentPassword?: string; newPassword?: string }) {
    const current = String(payload?.currentPassword || '');
    const next = String(payload?.newPassword || '');
    if (!current || !next) throw new BadRequestException('Enter your current and new password.');
    if (next.length < 8 || next.length > 128) throw new BadRequestException('The new password must be 8 to 128 characters.');
    if (next === current) throw new BadRequestException('The new password must be different from the current one.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'DELETED') throw new NotFoundException('User account not found.');
    if (!(await bcrypt.compare(current, user.passwordHash))) throw new UnauthorizedException('Current password is incorrect.');

    const changedAt = new Date();
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 12) } });
    const emailSent = this.emails
      ? await this.emails.sendPasswordChangedEmail(user.email, user.fullName, { userId, changedAt }).catch(() => false)
      : false;
    return { success: true, emailSent, message: 'Password changed successfully.' };
  }
}
