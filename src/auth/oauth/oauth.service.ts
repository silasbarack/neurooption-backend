import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

import { AuthService } from '../auth.service';
import { OAUTH_PROVIDERS, PROVIDER_SPECS, type OAuthProfile, type OAuthProvider } from './oauth-providers';

export const OAUTH_COOKIE = 'neo_oauth';
const STATE_TTL_SECONDS = 10 * 60;
const STATE_AUDIENCE = 'oauth-state';

const DEFAULT_BACKEND_URL = 'https://neurooption-backend.onrender.com';
const DEFAULT_FRONTEND_URL = 'https://neurooption-frontend.onrender.com';

type StatePayload = { p: OAuthProvider; s: string; v: string; o: string };

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Runs the authorization-code flow on the server. The provider's secret and
 * the PKCE verifier never reach the browser: the verifier and the expected
 * state travel in a short-lived, signed, HttpOnly cookie on this domain.
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  private env(name: string): string {
    return (process.env[name] || '').trim();
  }

  isProvider(value: string): value is OAuthProvider {
    return (OAUTH_PROVIDERS as string[]).includes(value);
  }

  isConfigured(provider: OAuthProvider): boolean {
    const spec = PROVIDER_SPECS[provider];
    return Boolean(this.env(spec.idEnv) && this.env(spec.secretEnv));
  }

  providers() {
    return Object.fromEntries(OAUTH_PROVIDERS.map((p) => [p, this.isConfigured(p)])) as Record<OAuthProvider, boolean>;
  }

  private backendUrl(): string {
    return (this.env('BACKEND_PUBLIC_URL') || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
  }

  callbackUrl(provider: OAuthProvider): string {
    return `${this.backendUrl()}/auth/oauth/${provider}/callback`;
  }

  get secureCookie(): boolean {
    return this.backendUrl().startsWith('https://');
  }

  /** Sends people back only to a NeuroOption frontend. */
  safeOrigin(candidate?: string): string {
    const allowed = [
      this.env('FRONTEND_URL'),
      DEFAULT_FRONTEND_URL,
      'https://neurooption.com',
      'https://www.neurooption.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]
      .filter(Boolean)
      .map((url) => url.replace(/\/+$/, ''));
    const wanted = (candidate || '').replace(/\/+$/, '');
    return allowed.includes(wanted) ? wanted : allowed[0];
  }

  /** The provider URL to send the person to, and the cookie to set first. */
  start(provider: OAuthProvider, origin?: string) {
    if (!this.isConfigured(provider)) throw new NotFoundException('This sign-in option is not available.');
    const spec = PROVIDER_SPECS[provider];
    const state = base64Url(randomBytes(24));
    const verifier = base64Url(randomBytes(32));
    const payload: StatePayload = { p: provider, s: state, v: verifier, o: this.safeOrigin(origin) };
    const cookie = this.jwt.sign(payload, { expiresIn: STATE_TTL_SECONDS, audience: STATE_AUDIENCE });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.env(spec.idEnv),
      redirect_uri: this.callbackUrl(provider),
      scope: spec.scope,
      state,
      ...(spec.extraAuthorizeParams || {}),
    });
    if (spec.pkce) {
      params.set('code_challenge', base64Url(createHash('sha256').update(verifier).digest()));
      params.set('code_challenge_method', 'S256');
    }
    return { url: `${spec.authorizeUrl}?${params}`, cookie, maxAgeSeconds: STATE_TTL_SECONDS };
  }

  /**
   * Finishes the flow and returns where to send the browser: the frontend's
   * /auth/social page with a session token, a sign-up token or an error code
   * in the URL fragment (never sent to a server).
   */
  async finish(provider: OAuthProvider, query: Record<string, string | undefined>, cookie: string | undefined): Promise<string> {
    let origin = this.safeOrigin();
    const to = (key: string, value: string) => `${origin}/auth/social#${key}=${encodeURIComponent(value)}`;

    let state: StatePayload;
    try {
      state = this.jwt.verify<StatePayload>(cookie || '', { audience: STATE_AUDIENCE });
    } catch {
      return to('error', 'expired');
    }
    origin = this.safeOrigin(state.o);
    if (state.p !== provider || !query.state || query.state !== state.s) return to('error', 'state');
    if (query.error) return to('error', 'cancelled');
    if (!query.code) return to('error', 'failed');

    try {
      const spec = PROVIDER_SPECS[provider];
      const accessToken = await spec.exchange({
        code: query.code,
        clientId: this.env(spec.idEnv),
        clientSecret: this.env(spec.secretEnv),
        redirectUri: this.callbackUrl(provider),
        verifier: state.v,
      });
      const profile: OAuthProfile = await spec.profile(accessToken);
      const result = await this.auth.socialSignIn(profile);
      if ('token' in result) return to('token', result.token);
      if ('signupToken' in result) return to('signup', result.signupToken);
      return to('error', result.error);
    } catch (error) {
      if (error instanceof BadRequestException) return to('error', 'unavailable');
      this.logger.error(`${provider} sign-in failed: ${error instanceof Error ? error.message : error}`);
      return to('error', 'failed');
    }
  }
}
