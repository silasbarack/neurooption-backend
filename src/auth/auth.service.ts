import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
  ) {}

  async register(dto: RegisterDto) {
    const fullName = dto.fullName?.trim();
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;

    if (!fullName) {
      throw new BadRequestException('Full name is required.');
    }

    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    if (!dto.password) {
      throw new BadRequestException('Password is required.');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists.');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone already exists.');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        wallets: {
          create: [
            { currency: 'KES', balance: 0, locked: 0 },
            { currency: 'USD', balance: 0, locked: 0 },
          ],
        },
        tradingAccounts: {
          create: [
            {
              type: 'DEMO',
              currency: 'USD',
              balance: 70000,
              locked: 0,
              isActive: true,
            },
            {
              type: 'REAL',
              currency: 'KES',
              balance: 0,
              locked: 0,
              isActive: true,
            },
          ],
        },
      },
      include: {
        wallets: true,
        tradingAccounts: true,
      },
    });

    await this.emailsService.sendAccountCreatedEmail(user.email, user.fullName);

    return this.buildAuthResponse(user);
  }

  async login(dto: { email: string; password: string }) {
    const email = dto.email?.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordIsValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse(user);
  }

  async forgotPassword(dto: { email: string }) {
    const email = dto.email?.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'If the email exists, a reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // create a PasswordResetToken record linked to the user
    await this.prisma.passwordResetToken.create({
      data: {
        token: passwordResetTokenHash,
        expiresAt: passwordResetExpiresAt,
        user: {
          connect: { id: user.id },
        },
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const sent = await this.emailsService.sendPasswordResetEmail(user.email, resetLink);

    if (!sent) {
      throw new BadRequestException(
        'Reset link was created, but email could not be sent. Check SMTP settings.',
      );
    }

    return {
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: { token: string; password: string }) {
    if (!dto.token) {
      throw new BadRequestException('Reset token is required.');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const passwordResetToken = crypto
      .createHash('sha256')
      .update(dto.token)
      .digest('hex');

    // find token record and include user
    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: passwordResetToken,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord || !tokenRecord.user) {
      throw new BadRequestException('Invalid or expired reset link.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // update user password
    await this.prisma.user.update({
      where: { id: tokenRecord.user.id },
      data: { passwordHash },
    });

    // remove the token record
    await this.prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });

    return {
      message: 'Password reset successful.',
    };
  }

  private buildAuthResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}