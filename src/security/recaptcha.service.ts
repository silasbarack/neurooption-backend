import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';

type GoogleAssessment = {
  success?: boolean;
  hostname?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  getPublicConfig(): { enabled: boolean; siteKey: string; version: 'v2' } {
    const enabled = process.env.RECAPTCHA_ENABLED === 'true';
    return { enabled, siteKey: enabled ? (process.env.RECAPTCHA_SITE_KEY || '') : '', version: 'v2' };
  }

  /** Test-only configuration; never includes Google's private verification key. */
  getTestConfig(): { available: boolean; siteKey: string; version: 'v2' } {
    const available = process.env.RECAPTCHA_TEST_ENABLED === 'true' &&
      process.env.RECAPTCHA_VERSION === 'v2' &&
      Boolean(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
    return { available, siteKey: available ? process.env.RECAPTCHA_SITE_KEY! : '', version: 'v2' };
  }

  /** Verifies a test token even when production enforcement is disabled. */
  async verifyTest(token: string | undefined): Promise<{ verified: boolean; code: string }> {
    if (process.env.RECAPTCHA_TEST_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Verification test is not enabled.');
    }
    if (process.env.RECAPTCHA_VERSION !== 'v2' ||
        !process.env.RECAPTCHA_SITE_KEY || !process.env.RECAPTCHA_SECRET_KEY) {
      throw new ServiceUnavailableException('Verification test keys are not configured.');
    }
    if (!token || token.length > 4096) {
      return { verified: false, code: 'missing-or-invalid-token' };
    }
    let response: GoogleAssessment;
    try {
      const upstream = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY.trim(), response: token }).toString(),
        signal: AbortSignal.timeout(7000),
      });
      if (!upstream.ok) throw new Error('Google siteverify error');
      response = await upstream.json() as GoogleAssessment;
    } catch {
      throw new ServiceUnavailableException('Google verification service is unavailable.');
    }
    const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
      'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
      .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    if (response.success && response.hostname && hosts.includes(response.hostname.toLowerCase())) {
      return { verified: true, code: 'verified' };
    }
    const allowedCodes = [
      'missing-input-secret','invalid-input-secret','missing-input-response',
      'invalid-input-response','bad-request','timeout-or-duplicate',
    ];
    const code = response.success ? 'hostname-mismatch' :
      (response['error-codes'] || []).find(x => allowedCodes.includes(x)) || 'not-verified';
    return { verified: false, code };
  }

  async verify(token: string | undefined, _expectedAction: string): Promise<void> {
    if (process.env.RECAPTCHA_ENABLED !== 'true') return;

    const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
    const siteKey = process.env.RECAPTCHA_SITE_KEY?.trim();
    if (!secret || !siteKey || process.env.RECAPTCHA_VERSION !== 'v2') {
      throw new ServiceUnavailableException('reCAPTCHA v2 is not configured.');
    }
    if (!token || token.length > 4096) {
      throw new ForbiddenException('Complete the I\'m not a robot check before continuing.');
    }

    let assessment: GoogleAssessment;
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }).toString(),
        signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) throw new Error('Google verification unavailable');
      assessment = await response.json() as GoogleAssessment;
    } catch {
      throw new ServiceUnavailableException('Security verification unavailable. Please retry.');
    }

    const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
      'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
      .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    if (process.env.NODE_ENV !== 'production') hosts.push('localhost', '127.0.0.1');
    if (assessment.success !== true) {
      console.warn('[RecaptchaService] Google verification rejected:', (assessment['error-codes'] || []).join(','));
    }
    if (assessment.success !== true || !assessment.hostname ||
        !hosts.includes(assessment.hostname.toLowerCase())) {
      throw new ForbiddenException('Security verification failed or expired. Please retry.');
    }
  }
}
