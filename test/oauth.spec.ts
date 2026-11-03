/// <reference types="jest" />
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';

import { AuthService } from '../src/auth/auth.service';
import type { OAuthProfile } from '../src/auth/oauth/oauth-providers';
import { OAuthService } from '../src/auth/oauth/oauth.service';

type User = { id: string; email: string; fullName: string; status: string; emailVerifiedAt: Date | null };
type Identity = { id: string; userId: string; provider: string; providerUserId: string; email: string | null };

function makeDb() {
  const users: User[] = [];
  const identities: Identity[] = [];
  const userById = (id: string) => users.find((u) => u.id === id)!;
  const prisma: any = {
    user: {
      findUnique: jest.fn(async ({ where }: any) => users.find((u) => (where.email ? u.email === where.email : u.id === where.id)) ?? null),
      update: jest.fn(async ({ where, data }: any) => Object.assign(userById(where.id), data)),
      create: jest.fn(async ({ data }: any) => {
        if (users.some((u) => u.email === data.email)) throw Object.assign(new Error('dup'), { code: 'P2002' });
        const user = { id: `user-${users.length + 1}`, status: 'PENDING_KYC', emailVerifiedAt: null, ...data };
        users.push(user);
        return user;
      }),
    },
    userIdentity: {
      findUnique: jest.fn(async ({ where }: any) => {
        const key = where.provider_providerUserId;
        const found = identities.find((i) => i.provider === key.provider && i.providerUserId === key.providerUserId);
        return found ? { ...found, user: userById(found.userId) } : null;
      }),
      create: jest.fn(async ({ data }: any) => {
        if (identities.some((i) => i.provider === data.provider && i.providerUserId === data.providerUserId)) {
          throw Object.assign(new Error('dup'), { code: 'P2002' });
        }
        const identity = { id: `id-${identities.length + 1}`, ...data };
        identities.push(identity);
        return identity;
      }),
      update: jest.fn(async () => ({})),
    },
    emailVerificationToken: { deleteMany: jest.fn(async () => ({})), create: jest.fn(async () => ({})) },
  };
  prisma.$transaction = jest.fn(async (fn: any) => fn(prisma));
  return { prisma, users, identities };
}

function makeServices() {
  const db = makeDb();
  const jwt = new JwtService({ secret: 'test-secret-for-oauth-specs-0123456789' });
  const emails = { sendAccountCreatedEmail: jest.fn(async () => true), appUrl: (path: string) => `https://neurooption.com${path}` };
  const config = { get: jest.fn() };
  const auth = new AuthService(db.prisma, jwt, emails as any, config as any);
  const oauth = new OAuthService(jwt, auth);
  return { ...db, jwt, emails, auth, oauth };
}

const google = (overrides: Partial<OAuthProfile> = {}): OAuthProfile => ({
  provider: 'google',
  subject: 'g-123',
  email: 'jane@example.com',
  emailVerified: true,
  name: 'Jane Wanjiku',
  ...overrides,
});

describe('social sign-in', () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env = {
      ...env,
      GOOGLE_CLIENT_ID: 'gid',
      GOOGLE_CLIENT_SECRET: 'gsecret',
      X_CLIENT_ID: 'xid',
      X_CLIENT_SECRET: 'xsecret',
      BACKEND_PUBLIC_URL: 'https://api.example.com',
    };
    delete process.env.FACEBOOK_APP_ID;
    delete process.env.FACEBOOK_APP_SECRET;
  });
  afterAll(() => {
    process.env = env;
  });

  it('lists only the providers that have credentials', () => {
    const { oauth } = makeServices();
    expect(oauth.providers()).toEqual({ google: true, x: true, facebook: false });
  });

  it('builds a PKCE authorization URL and keeps the verifier in a signed cookie', () => {
    const { oauth, jwt } = makeServices();
    const { url, cookie } = oauth.start('google', 'https://neurooption.com');
    const params = new URL(url).searchParams;
    expect(url.startsWith('https://accounts.google.com/o/oauth2/v2/auth?')).toBe(true);
    expect(params.get('client_id')).toBe('gid');
    expect(params.get('redirect_uri')).toBe('https://api.example.com/auth/oauth/google/callback');
    expect(params.get('code_challenge_method')).toBe('S256');

    const state = jwt.verify(cookie, { audience: 'oauth-state' });
    expect(state.s).toBe(params.get('state'));
    expect(state.o).toBe('https://neurooption.com');
    const challenge = createHash('sha256').update(state.v).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(params.get('code_challenge')).toBe(challenge);
    // The verifier itself never goes to the provider.
    expect(url).not.toContain(state.v);
  });

  it('only sends people back to a NeuroOption frontend', () => {
    const { oauth } = makeServices();
    expect(oauth.safeOrigin('https://evil.example')).not.toBe('https://evil.example');
    expect(oauth.safeOrigin('https://www.neurooption.com')).toBe('https://www.neurooption.com');
  });

  it('refuses an unconfigured provider', () => {
    const { oauth } = makeServices();
    expect(() => oauth.start('facebook')).toThrow();
  });

  it('rejects a callback whose state does not match the cookie', async () => {
    const { oauth } = makeServices();
    const { cookie } = oauth.start('google', 'https://neurooption.com');
    const target = await oauth.finish('google', { state: 'forged', code: 'c' }, cookie);
    expect(target).toBe('https://neurooption.com/auth/social#error=state');
  });

  it('treats a missing or expired cookie as expired', async () => {
    const { oauth } = makeServices();
    expect(await oauth.finish('google', { state: 's', code: 'c' }, undefined)).toMatch(/#error=expired$/);
  });

  it('reports a cancelled consent screen', async () => {
    const { oauth, jwt } = makeServices();
    const { cookie } = oauth.start('google', 'https://neurooption.com');
    const { s } = jwt.verify(cookie, { audience: 'oauth-state' });
    expect(await oauth.finish('google', { state: s, error: 'access_denied' }, cookie)).toMatch(/#error=cancelled$/);
  });

  it('exchanges the code with the verifier and signs a linked user in', async () => {
    const { oauth, jwt, users, identities } = makeServices();
    users.push({ id: 'user-1', email: 'jane@example.com', fullName: 'Jane', status: 'ACTIVE', emailVerifiedAt: null });
    identities.push({ id: 'id-1', userId: 'user-1', provider: 'google', providerUserId: 'g-123', email: 'jane@example.com' });

    const { cookie } = oauth.start('google', 'https://neurooption.com');
    const { s, v } = jwt.verify(cookie, { audience: 'oauth-state' });
    const calls: { url: string; body: string }[] = [];
    global.fetch = jest.fn(async (url: string, init: RequestInit = {}) => {
      calls.push({ url, body: String(init.body || '') });
      const payload = url.includes('/token')
        ? { access_token: 'at' }
        : { sub: 'g-123', email: 'jane@example.com', email_verified: true, name: 'Jane' };
      return { ok: true, status: 200, text: async () => JSON.stringify(payload) } as unknown as Response;
    }) as unknown as typeof fetch;

    const target = await oauth.finish('google', { state: s, code: 'auth-code' }, cookie);
    expect(calls[0].body).toContain(`code_verifier=${v}`);
    const token = decodeURIComponent(target.split('#token=')[1]);
    expect(target.startsWith('https://neurooption.com/auth/social#token=')).toBe(true);
    expect(jwt.verify(token).sub).toBe('user-1');
  });

  it('links an existing account only when the provider confirms the email', async () => {
    const { auth, users, identities } = makeServices();
    users.push({ id: 'user-1', email: 'jane@example.com', fullName: 'Jane', status: 'ACTIVE', emailVerifiedAt: null });

    expect(await auth.socialSignIn(google({ emailVerified: false }))).toEqual({ error: 'email-unverified' });
    expect(identities).toHaveLength(0);

    const result = await auth.socialSignIn(google({ email: 'JANE@example.com' }));
    expect('token' in result).toBe(true);
    expect(identities).toEqual([expect.objectContaining({ userId: 'user-1', provider: 'google', providerUserId: 'g-123' })]);
    expect(users[0].emailVerifiedAt).toBeInstanceOf(Date);
  });

  it('does not sign in to a deleted account', async () => {
    const { auth, users, identities } = makeServices();
    users.push({ id: 'user-1', email: 'deleted-user-1@deleted.neurooption.invalid', fullName: 'Deleted user', status: 'DELETED', emailVerifiedAt: null });
    identities.push({ id: 'id-1', userId: 'user-1', provider: 'google', providerUserId: 'g-123', email: null });
    expect(await auth.socialSignIn(google())).toEqual({ error: 'unavailable' });
  });

  it('asks a new person to confirm age and terms before creating the account', async () => {
    const { auth, users, identities, emails } = makeServices();
    const result = await auth.socialSignIn(google());
    if (!('signupToken' in result)) throw new Error('expected a sign-up token');
    expect(users).toHaveLength(0);

    expect(auth.readSocialSignup(result.signupToken)).toEqual({
      provider: 'google',
      email: 'jane@example.com',
      emailVerified: true,
      name: 'Jane Wanjiku',
    });
    await expect(auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: false })).rejects.toBeInstanceOf(BadRequestException);

    const done = await auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: true });
    expect(done.token).toBeTruthy();
    expect(users[0]).toMatchObject({ email: 'jane@example.com', fullName: 'Jane Wanjiku' });
    expect((users[0] as any).passwordHash).toMatch(/^\$2[ab]\$/);
    expect(users[0].emailVerifiedAt).toBeInstanceOf(Date);
    expect(identities).toEqual([expect.objectContaining({ provider: 'google', providerUserId: 'g-123' })]);
    // Provider-confirmed email: welcome email without a verification link.
    expect(emails.sendAccountCreatedEmail).toHaveBeenCalledWith('jane@example.com', 'Jane Wanjiku', expect.objectContaining({ verifyUrl: undefined }));

    // A second submit signs in to the same account instead of failing.
    const again = await auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: true });
    expect(again.token).toBeTruthy();
    expect(users).toHaveLength(1);
  });

  it('needs an email when the provider shares none, and leaves it unverified', async () => {
    const { auth, users, emails } = makeServices();
    const result = await auth.socialSignIn({ provider: 'x', subject: 'x-1', email: null, emailVerified: false, name: 'Jane' });
    if (!('signupToken' in result)) throw new Error('expected a sign-up token');

    await expect(auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: true })).rejects.toBeInstanceOf(BadRequestException);
    await auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: true, email: 'jane@example.com' });
    expect(users[0].emailVerifiedAt).toBeNull();
    expect(emails.sendAccountCreatedEmail).toHaveBeenCalledWith('jane@example.com', 'Jane', expect.objectContaining({ verifyUrl: expect.stringContaining('token=') }));
  });

  it('will not attach a typed-in email to someone else’s account', async () => {
    const { auth, users } = makeServices();
    users.push({ id: 'user-1', email: 'jane@example.com', fullName: 'Jane', status: 'ACTIVE', emailVerifiedAt: null });
    const result = await auth.socialSignIn({ provider: 'x', subject: 'x-1', email: null, emailVerified: false, name: null });
    if (!('signupToken' in result)) throw new Error('expected a sign-up token');
    await expect(
      auth.completeSocialSignup({ signupToken: result.signupToken, acceptTerms: true, email: 'jane@example.com' }),
    ).rejects.toThrow(/already exists/);
  });

  it('rejects a tampered or expired sign-up token', async () => {
    const { auth } = makeServices();
    await expect(auth.completeSocialSignup({ signupToken: 'not-a-token', acceptTerms: true })).rejects.toThrow(/expired/);
  });
});
