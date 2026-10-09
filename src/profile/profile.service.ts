import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../config/prisma.service';
import { publicUser } from '../users/public-user';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

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

    if (!user || user.deletedAt || user.status === 'DELETED') {
      throw new NotFoundException('User not found');
    }

    return publicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt || user.status === 'DELETED') {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
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
      where: { id: userId, deletedAt: null, status: { not: 'DELETED' } },
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
      },
      include: {
        wallets: true,
        kycRecords: true,
      },
    });

    return publicUser(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt || user.status === 'DELETED') {
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

    await this.prisma.user.update({
      where: { id: userId, deletedAt: null, status: { not: 'DELETED' }, passwordHash: user.passwordHash },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

}