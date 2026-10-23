import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

const RESET_PURPOSE = 'password-reset';
const MAX_RESET_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    await this.usersService.updateLastLogin(user.id);
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: '7d',
      user: {
        id: user.id, email: user.email, name: user.name,
        balance: user.balance, demoBalance: user.demoBalance,
        role: user.role, kycStatus: user.kycStatus,
        createdAt: user.createdAt,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, passwordHash: hash });
    // Don't block or fail registration on SMTP latency/outages; MailService logs failures.
    void this.mailService.sendWelcome(user.email, user.name);
    return this.login(user);
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }

  // Codes are stored as an HMAC keyed with JWT_SECRET (never in plain text). A code expires
  // after PASSWORD_RESET_CODE_TTL_MINUTES and is cancelled after MAX_RESET_ATTEMPTS wrong guesses.
  private hashResetCode(userId: string, code: string) {
    return createHmac('sha256', this.config.get('JWT_SECRET', 'neurooption-secret-key'))
      .update(`${RESET_PURPOSE}:${userId}:${code}`)
      .digest('hex');
  }

  async forgotPassword(email: string) {
    const response = { message: 'If an account exists for that email, a 6-digit verification code has been sent.' };
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) return response;

    const ttlMinutes = Number(this.config.get('PASSWORD_RESET_CODE_TTL_MINUTES', 15));
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    await this.usersService.setResetCode(user.id, this.hashResetCode(user.id, code), new Date(Date.now() + ttlMinutes * 60_000));

    const sent = await this.mailService.sendPasswordResetCode(user.email, user.name, code, ttlMinutes);
    if (!sent) this.logger.error(`Password reset code email for user ${user.id} was not delivered`);
    return response;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const invalid = new BadRequestException('Invalid or expired verification code');
    const user = await this.usersService.findWithResetCode(email);
    if (!user?.resetCodeHash || !user.resetCodeExpiresAt) throw invalid;

    if (user.resetCodeExpiresAt.getTime() < Date.now() || user.resetCodeAttempts >= MAX_RESET_ATTEMPTS) {
      await this.usersService.clearResetCode(user.id);
      throw new BadRequestException('This verification code has expired. Please request a new one.');
    }

    const expected = Buffer.from(user.resetCodeHash, 'hex');
    const actual = Buffer.from(this.hashResetCode(user.id, code), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await this.usersService.incrementResetAttempts(user.id);
      const left = MAX_RESET_ATTEMPTS - user.resetCodeAttempts - 1;
      if (left <= 0) {
        await this.usersService.clearResetCode(user.id);
        throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
      }
      throw new BadRequestException(`Incorrect verification code. ${left} attempt${left === 1 ? '' : 's'} left.`);
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(user.id, hash);
    await this.usersService.clearResetCode(user.id);
    void this.mailService.sendPasswordChanged(user.email, user.name);
    return { message: 'Password has been reset. You can now log in with your new password.' };
  }
}
