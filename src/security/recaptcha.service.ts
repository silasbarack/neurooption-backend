import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';

type GoogleAssessment = {
  success?: boolean;
  hostname?: string;
  challenge_ts?: string;
};

@Injectable()
export class RecaptchaService {
  getPublicConfig(): { enabled: boolean; siteKey: string; version: 'v2' } {
    const enabled = process.env.RECAPTCHA_ENABLED === 'true';
    return { enabled, siteKey: enabled ? (process.env.RECAPTCHA_SITE_KEY || '') : '', version: 'v2' };
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
    const issued = Date.parse(assessment.challenge_ts || '');
    const age = Date.now() - issued;
    if (assessment.success !== true || !assessment.hostname ||
        !hosts.includes(assessment.hostname.toLowerCase()) ||
        !Number.isFinite(issued) || age < -30000 || age > 120000) {
      throw new ForbiddenException('Security verification failed or expired. Please retry.');
    }
  }
}
