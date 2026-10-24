import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly emails?: EmailsService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        kycRecords: true,
        transactions: true,
        deposits: true,
        withdrawals: true,
        payouts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Email changes are not self-service: a stolen session could otherwise
    // redirect password resets to an attacker's address.
    if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
      throw new BadRequestException('To change your email address, please contact Support.');
    }

    if (dto.phone && dto.phone !== user.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });

      if (phoneExists) {
        throw new ConflictException('Phone already exists');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
      },
      include: {
        wallets: true,
        kycRecords: true,
      },
    });

    return this.sanitizeUser(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validPassword = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    const changedAt = new Date();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });
    const emailSent = this.emails
      ? await this.emails.sendPasswordChangedEmail(user.email, user.fullName, { userId, changedAt }).catch(() => false)
      : false;

    return {
      message: 'Password changed successfully',
      emailSent,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}