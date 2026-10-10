import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

/** Google reCAPTCHA v2 checkbox: token is validated by Google server-side. */
type GoogleAssessment = {
  success?: boolean;
  hostname?: string;
  challenge_ts?: string;
};

@Injectable()
export class RecaptchaService {
  getPublicConfig(): { enabled: boolean; siteKey: string; version: 'v2' } {
    const enabled = process.env.RECAPTCHA_ENABLED === 'true' && process.env.RECAPTCHA_VERSION === 'v2';
    return {
      enabled,
      version: 'v2',
      siteKey: enabled ? (process.env.RECAPTCHA_SITE_KEY || '') : '',
    };
  }

  async verify(token: string | undefined, _expectedAction: string): Promise<void> {
    if (process.env.RECAPTCHA_ENABLED !== 'true') return;
    if (process.env.RECAPTCHA_VERSION !== 'v2') {
      throw new ServiceUnavailableException('Captcha configuration requires reCAPTCHA v2 checkbox credentials.');
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
    const siteKey = process.env.RECAPTCHA_SITE_KEY?.trim();
    if (!secret || !siteKey) {
      throw new ServiceUnavailableException('Security verification is temporarily unavailable.');
    }
    if (!token || token.length > 4096) {
      throw new ForbiddenException('Security verification is required. Please try again.');
    }

    let assessment: GoogleAssessment;
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }).toString(),
        signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) throw new Error('Verification provider unavailable');
      assessment = (await response.json()) as GoogleAssessment;
    } catch {
      throw new ServiceUnavailableException(
        'Security verification could not be completed. Please try again shortly.',
      );
    }

    const allowedHosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
      'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);

    if (process.env.NODE_ENV !== 'production') {
      allowedHosts.push('localhost', '127.0.0.1');
    }

    const issuedAt = Date.parse(assessment.challenge_ts || '');
    const age = Date.now() - issuedAt;
    const fresh = Number.isFinite(issuedAt) && age >= -30_000 && age <= 120_000;
    const valid =
      assessment.success === true &&
      typeof assessment.hostname === 'string' &&
      allowedHosts.includes(assessment.hostname.toLowerCase()) &&
      fresh;

    if (!valid) {
      throw new ForbiddenException(
        'Security verification did not pass. Please try again.',
      );
    }
  }
}
