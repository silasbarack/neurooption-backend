import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException, TooManyRequestsException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RecaptchaService } from '../security/recaptcha.service';
import type { AuthenticatedRequest } from '../payments/authenticated-request';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  private readonly testAttempts = new Map<string, { count: number; since: number }>();
  constructor(private readonly authService: AuthService, private readonly captcha: RecaptchaService) {}

  @Get('recaptcha-config')
  recaptchaConfig() { return this.captcha.getPublicConfig(); }

  @Get('recaptcha-test/config')
  @UseGuards(JwtAuthGuard)
  testConfig() { return this.captcha.getTestConfig(); }

  @Post('recaptcha-test/verify')
  @UseGuards(JwtAuthGuard)
  async testCaptcha(@Req() req: AuthenticatedRequest, @Body() body: { token?: string }) {
    const identity = req.user.id;
    const now = Date.now();
    const prior = this.testAttempts.get(identity);
    const bucket = prior && now - prior.since < 60_000 ? prior : { count: 0, since: now };
    if (bucket.count >= 5) throw new TooManyRequestsException('Please wait a minute before another test.');
    bucket.count += 1;
    this.testAttempts.set(identity, bucket);
    if (typeof body?.token !== 'string' || body.token.length > 4096) {
      throw new BadRequestException('Complete a fresh Google checkbox.');
    }
    return this.captcha.verifyTest(body.token);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.captcha.verify(dto.recaptchaToken, 'register');
    return this.authService.register(dto);
  }

  @Post('resend-welcome')
  @UseGuards(JwtAuthGuard)
  resendWelcome(@Req() req: AuthenticatedRequest) {
    return this.authService.resendWelcomeEmail(req.user.id);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    await this.captcha.verify(dto.recaptchaToken, 'login');
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.captcha.verify(dto.recaptchaToken, 'forgot_password');
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.captcha.verify(dto.recaptchaToken, 'reset_password');
    return this.authService.resetPassword(dto);
  }
}