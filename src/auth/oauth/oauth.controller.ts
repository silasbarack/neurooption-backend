import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from '../auth.service';
import { CompleteSocialSignupDto, SocialSignupTokenDto } from './oauth.dto';
import { OAUTH_COOKIE, OAuthService } from './oauth.service';

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

@Controller('auth/oauth')
export class OAuthController {
  constructor(
    private readonly oauth: OAuthService,
    private readonly auth: AuthService,
  ) {}

  /** Which buttons the sign-in page should show. */
  @Get('providers')
  providers() {
    return this.oauth.providers();
  }

  @Get(':provider/start')
  start(@Param('provider') provider: string, @Query('origin') origin: string | undefined, @Res() res: Response) {
    if (!this.oauth.isProvider(provider)) throw new NotFoundException();
    const { url, cookie, maxAgeSeconds } = this.oauth.start(provider, origin);
    res.cookie(OAUTH_COOKIE, cookie, {
      httpOnly: true,
      secure: this.oauth.secureCookie,
      sameSite: 'lax',
      path: '/auth/oauth',
      maxAge: maxAgeSeconds * 1000,
    });
    res.redirect(302, url);
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query() query: Record<string, string | undefined>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!this.oauth.isProvider(provider)) throw new NotFoundException();
    const target = await this.oauth.finish(provider, query, readCookie(req, OAUTH_COOKIE));
    res.clearCookie(OAUTH_COOKIE, { path: '/auth/oauth' });
    res.redirect(302, target);
  }

  @Post('signup/preview')
  @HttpCode(200)
  preview(@Body() dto: SocialSignupTokenDto) {
    return this.auth.readSocialSignup(dto.signupToken);
  }

  @Post('signup/complete')
  @HttpCode(200)
  complete(@Body() dto: CompleteSocialSignupDto) {
    return this.auth.completeSocialSignup(dto);
  }
}
