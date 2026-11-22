/// <reference types="jest" />
import { ForbiddenException, ServiceUnavailableException, ValidationPipe } from '@nestjs/common';

import { AuthController } from '../src/auth/auth.controller';
import { LoginDto } from '../src/auth/dto/login.dto';
import { RecaptchaService } from '../src/security/recaptcha.service';

const ENV_KEYS = [
  'RECAPTCHA_ENABLED', 'RECAPTCHA_TEST_ENABLED', 'RECAPTCHA_VERSION', 'RECAPTCHA_SITE_KEY',
  'RECAPTCHA_SECRET_KEY', 'RECAPTCHA_ALLOWED_HOSTNAMES', 'NODE_ENV',
];
const saved: Record<string, string | undefined> = {};

function mockGoogle(body: unknown, ok = true) {
  const fn = jest.fn(async () => ({ ok, json: async () => body }));
  (global as any).fetch = fn;
  return fn;
}

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.RECAPTCHA_ENABLED = 'true';
  process.env.RECAPTCHA_VERSION = 'v2';
  process.env.RECAPTCHA_SITE_KEY = 'site-key';
  process.env.RECAPTCHA_SECRET_KEY = ' secret-key ';
  process.env.NODE_ENV = 'production';
  delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('RecaptchaService.verify', () => {
  const svc = new RecaptchaService();

  it('is a no-op when enforcement is disabled', async () => {
    process.env.RECAPTCHA_ENABLED = 'false';
    const fetch = mockGoogle({});
    await expect(svc.verify(undefined, 'login')).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('accepts a valid token from an allowed hostname and sends the trimmed secret', async () => {
    const fetch = mockGoogle({ success: true, hostname: 'www.neurooption.com' });
    await expect(svc.verify('tok', 'login')).resolves.toBeUndefined();
    const [url, init] = fetch.mock.calls[0] as unknown as [string, any];
    expect(url).toBe('https://www.google.com/recaptcha/api/siteverify');
    expect(init.method).toBe('POST');
    const params = new URLSearchParams(init.body);
    expect(params.get('secret')).toBe('secret-key');
    expect(params.get('response')).toBe('tok');
  });

  it('rejects a missing token without calling Google', async () => {
    const fetch = mockGoogle({});
    await expect(svc.verify(undefined, 'login')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(svc.verify('x'.repeat(4097), 'login')).rejects.toBeInstanceOf(ForbiddenException);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects when Google says the token is invalid or reused', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockGoogle({ success: false, 'error-codes': ['timeout-or-duplicate'] });
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ForbiddenException);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('rejects a token solved on a hostname that is not allowed', async () => {
    mockGoogle({ success: true, hostname: 'evil.example.com' });
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('honours RECAPTCHA_ALLOWED_HOSTNAMES', async () => {
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES = 'app.example.com';
    mockGoogle({ success: true, hostname: 'APP.example.com' });
    await expect(svc.verify('tok', 'login')).resolves.toBeUndefined();
    mockGoogle({ success: true, hostname: 'neurooption.com' });
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows localhost only outside production', async () => {
    mockGoogle({ success: true, hostname: 'localhost' });
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ForbiddenException);
    process.env.NODE_ENV = 'development';
    await expect(svc.verify('tok', 'login')).resolves.toBeUndefined();
  });

  it('fails closed (503) when keys are missing while enforcement is on', async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fails closed (503) when Google is unreachable', async () => {
    (global as any).fetch = jest.fn(async () => { throw new Error('network'); });
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ServiceUnavailableException);
    mockGoogle({}, false);
    await expect(svc.verify('tok', 'login')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('RecaptchaService public config', () => {
  const svc = new RecaptchaService();
  it('exposes the site key (never the secret) only when enabled', () => {
    expect(svc.getPublicConfig()).toEqual({ enabled: true, siteKey: 'site-key', version: 'v2' });
    expect(JSON.stringify(svc.getPublicConfig())).not.toContain('secret');
    process.env.RECAPTCHA_ENABLED = 'false';
    expect(svc.getPublicConfig()).toEqual({ enabled: false, siteKey: '', version: 'v2' });
  });
});

describe('AuthController reCAPTCHA wiring', () => {
  function build() {
    const authService: any = {
      login: jest.fn(async () => ({ ok: true })),
      register: jest.fn(async () => ({ ok: true })),
      forgotPassword: jest.fn(async () => ({ ok: true })),
      resetPassword: jest.fn(async () => ({ ok: true })),
    };
    return { authService, controller: new AuthController(authService, new RecaptchaService()) };
  }

  it('keeps recaptchaToken through the global whitelist ValidationPipe', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true });
    const login = await pipe.transform(
      { email: 'a@b.co', password: 'secret1', recaptchaToken: 'tok' },
      { type: 'body', metatype: LoginDto },
    );
    expect(login.recaptchaToken).toBe('tok');
  });

  it('blocks login, register, forgot and reset when the check fails', async () => {
    const { controller, authService } = build();
    mockGoogle({ success: false, 'error-codes': ['invalid-input-response'] });
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(controller.login({ email: 'a@b.co', password: 'x', recaptchaToken: 'bad' } as any)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(controller.register({ recaptchaToken: 'bad' } as any)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(controller.forgotPassword({ recaptchaToken: 'bad' } as any)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(controller.resetPassword({ recaptchaToken: 'bad' } as any)).rejects.toBeInstanceOf(ForbiddenException);
    expect(authService.login).not.toHaveBeenCalled();
    expect(authService.register).not.toHaveBeenCalled();
    expect(authService.forgotPassword).not.toHaveBeenCalled();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('lets login through when the check passes', async () => {
    const { controller, authService } = build();
    mockGoogle({ success: true, hostname: 'neurooption.com' });
    await expect(controller.login({ email: 'a@b.co', password: 'x', recaptchaToken: 'ok' } as any)).resolves.toEqual({ ok: true });
    expect(authService.login).toHaveBeenCalled();
  });
});
