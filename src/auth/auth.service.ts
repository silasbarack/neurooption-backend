import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';

type RegisterPayload = {
  fullName?: string;
  name?: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  token: string;
  password: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173'
    ).replace(/\/+$/, '');
  }

  private getUserModelFields(): string[] {
    const runtimeModel = (this.prisma as any)?._runtimeDataModel?.models?.User;

    if (!runtimeModel?.fields) {
      return [];
    }

    return runtimeModel.fields.map((field: any) => field.name);
  }

  private getPasswordFieldName(): string {
    const fields = this.getUserModelFields();

    if (fields.includes('password')) return 'password';
    if (fields.includes('passwordHash')) return 'passwordHash';
    if (fields.includes('hashedPassword')) return 'hashedPassword';

    return 'password';
  }

  private getNameFieldName(): string | null {
    const fields = this.getUserModelFields();

    if (fields.includes('fullName')) return 'fullName';
    if (fields.includes('name')) return 'name';

    return null;
  }

  private getUserDisplayName(user: any): string {
    return (
      user?.fullName ||
      user?.name ||
      user?.email?.split('@')?.[0] ||
      'Trader'
    );
  }

  private removeSensitiveFields(user: any) {
    if (!user) return null;

    const {
      password,
      passwordHash,
      hashedPassword,
      ...safeUser
    } = user;

    return safeUser;
  }

  private signToken(user: any): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private async sendEmailSafely(
    label: string,
    send: () => Promise<boolean>,
  ): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.logger.error(`${label} failed`, error as Error);
    }
  }

  async register(payload: RegisterPayload) {
    const email = this.normalizeEmail(payload.email || '');
    const fullName = (payload.fullName || payload.name || '').trim();

    if (!email || !payload.password) {
      throw new BadRequestException('Email and password are required.');
    }

    if (payload.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const passwordField = this.getPasswordFieldName();
    const nameField = this.getNameFieldName();

    const userData: Record<string, any> = {
      email,
      [passwordField]: hashedPassword,
    };

    if (nameField) {
      userData[nameField] = fullName;
    }

    const user = await this.prisma.user.create({
      data: userData as any,
    });

    await this.sendEmailSafely('sendAccountCreatedEmail', () =>
      this.emailsService.sendAccountCreatedEmail(
        user.email,
        this.getUserDisplayName(user),
      ),
    );

    const token = this.signToken(user);

    return {
      success: true,
      message: 'Account created successfully.',
      token,
      accessToken: token,
      user: this.removeSensitiveFields(user),
    };
  }

  async login(payload: LoginPayload) {
    const email = this.normalizeEmail(payload.email || '');

    if (!email || !payload.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordField = this.getPasswordFieldName();
    const savedPassword = (user as any)[passwordField];

    if (!savedPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(payload.password, savedPassword);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.signToken(user);

    return {
      success: true,
      message: 'Signed in successfully.',
      token,
      accessToken: token,
      user: this.removeSensitiveFields(user),
    };
  }

  async forgotPassword(payload: ForgotPasswordPayload) {
    const email = this.normalizeEmail(payload.email || '');

    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: true,
        message: 'If this email exists, a password reset message has been sent.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${token}`;

    await this.sendEmailSafely('sendPasswordResetEmail', () =>
      this.emailsService.sendPasswordResetEmail(
        user.email,
        resetUrl,
        this.getUserDisplayName(user),
      ),
    );

    return {
      success: true,
      message: 'If this email exists, a password reset message has been sent.',
    };
  }

  async resetPassword(payload: ResetPasswordPayload) {
    if (!payload.token || !payload.password) {
      throw new BadRequestException('Token and new password are required.');
    }

    if (payload.password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: payload.token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const passwordField = this.getPasswordFieldName();

    await this.prisma.user.update({
      where: {
        id: resetRecord.userId,
      },
      data: {
        [passwordField]: hashedPassword,
      } as any,
    });

    await this.prisma.passwordResetToken.delete({
      where: {
        id: resetRecord.id,
      },
    });

    await this.sendEmailSafely('sendPasswordChangedEmail', () =>
      this.emailsService.sendPasswordChangedEmail(
        resetRecord.user.email,
        this.getUserDisplayName(resetRecord.user),
      ),
    );

    return {
      success: true,
      message: 'Password reset successfully.',
    };
  }
}