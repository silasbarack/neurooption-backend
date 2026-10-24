import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
import { createHash } from 'node:crypto';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../config/prisma.service';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  EMAIL_LOGO_BASE64,
  EMAIL_LOGO_CID,
  EMAIL_LOGO_FILENAME,
  EMAIL_LOGO_HEIGHT,
  EMAIL_LOGO_MIME,
  EMAIL_LOGO_WIDTH,
} from './email-logo';

type MoneyEmailData = {
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  dateTime: string;
};

export type AccountDeletionEmailData = {
  email: string;
  fullName: string;
  /** Quote this when contacting Support, e.g. "DEL-3F9A12BC". */
  reference: string;
  deletedAt: Date;
  /** The reason the user chose, as shown to them. */
  reasonLabel?: string;
};

type EmailTemplate = {
  subject: string;
  /** Plain-text alternative, written per template. */
  body: string;
  /** Branded HTML version built with the shared layout. */
  html?: string;
};

type Tone = 'success' | 'info' | 'danger';

type DetailRow = [label: string, value: string];

type EmailProvider = 'brevo' | 'resend' | 'smtp' | 'none';

/** How a message is tracked, de-duplicated and retried. */
export type SendOptions = {
  /** Short machine name, e.g. "password_code" or "deposit_completed". */
  kind?: string;
  userId?: string | null;
  /** Same key = same event: a second send is skipped instead of emailing twice. */
  dedupeKey?: string;
  /**
   * The message carries a code or one-time link. Its body is never stored,
   * so it is only retried in-process; the user can request a new one.
   */
  sensitive?: boolean;
};

type DeliveryResult = { provider: Exclude<EmailProvider, 'none'>; messageId: string | null };

/** A provider failure, marked permanent when retrying cannot help. */
class DeliveryError extends Error {
  constructor(message: string, readonly permanent: boolean) {
    super(message);
  }
}

// Retry schedule for temporary failures: quick in-process attempts, then the
// background worker (non-sensitive emails only) with growing delays.
const IN_PROCESS_RETRY_DELAYS_MS = [400, 1500];
const WORKER_BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 3 * 60 * 60_000];
const MAX_TOTAL_ATTEMPTS = IN_PROCESS_RETRY_DELAYS_MS.length + 1 + WORKER_BACKOFF_MS.length;
const WORKER_INTERVAL_MS = 30_000;
const STALE_SENDING_MS = 10 * 60_000;

// Placeholder swapped for the real logo src per provider: an inline CID
// attachment over SMTP, a hosted URL for the HTTPS APIs.
const LOGO_SRC_PLACEHOLDER = '__NEUROOPTION_LOGO_SRC__';

const DEFAULT_FRONTEND_URL = 'https://neurooption-frontend.onrender.com';

// Light brand palette shared by every email (inline styles only).
const BRAND = {
  page: '#F6F9FC',
  card: '#FFFFFF',
  heading: '#0D315E',
  accent: '#0879AD',
  teal: '#17ADB4',
  divider: '#DCE7EF',
  text: '#182B43',
  muted: '#526579',
  subtle: '#F6F9FC',
  gradient: 'linear-gradient(120deg,#0D315E,#0879AD,#17ADB4)',
} as const;

const FONT_STACK =
  "'Noto Sans',Arial,Helvetica,sans-serif";

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  success: { bg: '#E8F6EF', fg: '#0B6E47', border: '#BEE5D1' },
  info: { bg: '#E7F3F9', fg: '#0870A0', border: '#C3E0EE' },
  danger: { bg: '#FDEFEE', fg: '#B42318', border: '#F4CBC6' },
};

// Render free web services block outbound SMTP ports 25/465/587, so an
// unreachable SMTP server must fail fast instead of hanging the request.
const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 20_000;
const HTTP_API_TIMEOUT_MS = 15_000;

@Injectable()
export class EmailsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailsService.name);
  private transporter: Transporter | null = null;
  private smtpVerifiedAt = 0;
  private worker: NodeJS.Timeout | null = null;
  private workerBusy = false;

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  onModuleInit() {
    const provider = this.getProvider();

    if (provider === 'none') {
      this.logger.warn(`Email is not configured. ${this.missingConfiguration()}`);
      return;
    }

    for (const warning of this.configurationWarnings()) this.logger.warn(warning);
    this.logger.log(
      `Email provider: ${provider}; sender domain ${this.senderDomain() || 'unknown'}; links point to ${this.getFrontendUrl()}; recipient addresses not logged.`,
    );

    if (provider === 'smtp') {
      this.verifyDeliveryConfiguration(true)
        .then(() => this.logger.log('SMTP connection and authentication verified.'))
        .catch((error) =>
          this.logger.error(
            `SMTP connection check failed: ${this.errorMessage(error)}. ` +
              'If this runs on a Render free instance, SMTP ports are blocked; use BREVO_API_KEY or RESEND_API_KEY, or SMTP_PORT=2525 with a provider that supports it.',
          ),
        );
    }
    if (provider === 'brevo') void this.checkBrevoAccount();

    if (this.prisma && this.env('EMAIL_RETRY_WORKER').toLowerCase() !== 'off') {
      this.worker = setInterval(() => void this.processRetryQueue(), WORKER_INTERVAL_MS);
      this.worker.unref?.();
    }
  }

  onModuleDestroy() {
    if (this.worker) clearInterval(this.worker);
  }

  /** Problems that hurt delivery without stopping it. Never includes secrets. */
  configurationWarnings(): string[] {
    const warnings: string[] = [];
    const provider = this.getProvider();
    const domain = this.senderDomain();
    if (!this.env('FRONTEND_URL')) {
      warnings.push(`FRONTEND_URL is not set; email links fall back to ${DEFAULT_FRONTEND_URL}.`);
    } else if (!/^https:\/\//i.test(this.getFrontendUrl()) && process.env.NODE_ENV === 'production') {
      warnings.push('FRONTEND_URL is not HTTPS; email links and the hosted logo should use https://.');
    }
    if (provider !== 'smtp' && /^(gmail|googlemail|yahoo|outlook|hotmail)\./i.test(domain)) {
      warnings.push(`EMAIL_FROM uses ${domain}. Providers cannot sign mail for that domain, so it will often fail DMARC and land in spam. Send from a domain you control, e.g. no-reply@neurooption.com.`);
    }
    if (provider === 'smtp' && /gmail/i.test(this.env('SMTP_SERVICE') || this.env('SMTP_HOST'))) {
      warnings.push('Sending through Gmail SMTP: the sender is a personal Gmail address and delivery is not tracked. Use Brevo with an authenticated domain for reliable delivery.');
    }
    return warnings;
  }

  /**
   * Names the variables a provider still needs, so the start-up log shows
   * the cause. Only variable names are reported, never their values.
   */
  missingConfiguration(): string {
    const requested = this.env('EMAIL_PROVIDER').toLowerCase() || 'auto';
    const missing = (names: string[]) => names.filter((name) => !this.env(name));
    const smtpMissing = missing(['SMTP_USER', 'SMTP_PASS']);
    if (!this.env('SMTP_SERVICE') && !this.env('SMTP_HOST')) smtpMissing.push('SMTP_SERVICE or SMTP_HOST');
    const needs: Record<string, string[]> = {
      smtp: smtpMissing,
      brevo: missing(['BREVO_API_KEY']),
      resend: missing(['RESEND_API_KEY']),
    };
    if (requested === 'auto') {
      return `EMAIL_PROVIDER is ${this.env('EMAIL_PROVIDER') ? 'auto' : 'not set (auto)'} and no provider is complete: ` +
        `set BREVO_API_KEY, RESEND_API_KEY, or ${needs.smtp.join(', ')} for SMTP.`;
    }
    if (!needs[requested]) return 'EMAIL_PROVIDER must be auto, smtp, brevo or resend.';
    return `EMAIL_PROVIDER is ${requested} but ${needs[requested].join(', ')} ${needs[requested].length > 1 ? 'are' : 'is'} empty or not set.`;
  }

  /** The active provider, for diagnostics. */
  currentProvider(): EmailProvider {
    return this.getProvider();
  }

  /** The From address in use (never a secret). */
  senderAddress(): string {
    return this.getFromAddress();
  }

  private senderDomain(): string {
    return (this.parseFromAddress().email.split('@')[1] || '').toLowerCase();
  }

  /**
   * Confirms the Brevo API key works and the sender's domain is authenticated
   * there (DKIM + Brevo code). Read-only calls; nothing is sent.
   */
  async checkBrevoAccount(): Promise<{ keyValid: boolean; domain: string; authenticated: boolean | null }> {
    const domain = this.senderDomain();
    const headers = { 'api-key': this.env('BREVO_API_KEY'), accept: 'application/json' };
    try {
      const account = await fetch('https://api.brevo.com/v3/account', { headers, signal: AbortSignal.timeout(HTTP_API_TIMEOUT_MS) });
      if (!account.ok) {
        this.logger.error(`Brevo API key check failed (HTTP ${account.status}). Emails will be rejected until BREVO_API_KEY is fixed.`);
        return { keyValid: false, domain, authenticated: null };
      }
      const domains = await fetch('https://api.brevo.com/v3/senders/domains', { headers, signal: AbortSignal.timeout(HTTP_API_TIMEOUT_MS) });
      const body = domains.ok ? (await domains.json().catch(() => null)) as { domains?: Array<{ domain_name?: string; authenticated?: boolean; verified?: boolean }> } | null : null;
      const entry = body?.domains?.find((d) => (d.domain_name || '').toLowerCase() === domain);
      const authenticated = entry ? Boolean(entry.authenticated) : false;
      if (authenticated) this.logger.log(`Brevo API key valid; sender domain ${domain} is authenticated in Brevo.`);
      else this.logger.warn(`Brevo API key valid, but sender domain ${domain} is ${entry ? 'not yet authenticated' : 'not added'} in Brevo. Add its DNS records (Brevo code, DKIM, SPF, DMARC) and verify it.`);
      return { keyValid: true, domain, authenticated };
    } catch (error) {
      this.logger.warn(`Brevo account check could not run: ${this.errorMessage(error)}`);
      return { keyValid: false, domain, authenticated: null };
    }
  }

  private env(name: string): string {
    return (process.env[name] || '').trim();
  }

  private errorMessage(error: unknown): string {
    let value = error instanceof Error ? error.message : String(error);
    // The provider's error body may echo an email or a configured key.
    value = value.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[email]');
    for (const key of ['SMTP_PASS', 'BREVO_API_KEY', 'RESEND_API_KEY']) {
      const secret = this.env(key);
      if (secret && secret.length > 3) value = value.split(secret).join('[secret]');
    }
    return value.slice(0, 260);
  }

  private recipientTag(email: string): string {
    return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 12);
  }

  private getProvider(): EmailProvider {
    const requested = this.env('EMAIL_PROVIDER').toLowerCase();
    const smtpReady = !!this.env('SMTP_USER') && !!this.env('SMTP_PASS') &&
      (!!this.env('SMTP_SERVICE') || !!this.env('SMTP_HOST'));
    const available: Record<Exclude<EmailProvider, 'none'>, boolean> = {
      smtp: smtpReady,
      brevo: !!this.env('BREVO_API_KEY'),
      resend: !!this.env('RESEND_API_KEY'),
    };

    // An explicit choice prevents a forgotten API key silently overriding SMTP.
    if (requested && requested !== 'auto') {
      if (!Object.prototype.hasOwnProperty.call(available, requested)) {
        this.logger.error('EMAIL_PROVIDER must be auto, smtp, brevo or resend.');
        return 'none';
      }
      const provider = requested as Exclude<EmailProvider, 'none'>;
      return available[provider] ? provider : 'none';
    }

    if (available.brevo) return 'brevo';
    if (available.resend) return 'resend';
    return available.smtp ? 'smtp' : 'none';
  }

  private getTransporterConfig() {
    const service = this.env('SMTP_SERVICE');
    const host = this.env('SMTP_HOST');
    const isGmail = /gmail/i.test(service || host);

    const config: SMTPTransport.Options = {
      auth: {
        user: this.env('SMTP_USER'),
        // Gmail shows app passwords in groups of four separated by spaces.
        pass: isGmail
          ? this.env('SMTP_PASS').replace(/\s+/g, '')
          : this.env('SMTP_PASS'),
      },
      connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: SMTP_CONNECTION_TIMEOUT_MS,
      socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
      // Always validate provider TLS certificates. Disabling verification
      // exposes SMTP credentials and account recovery codes.
      tls: { rejectUnauthorized: true },
    };

    // An explicit host takes precedence over a service preset. This permits
    // providers that expose SMTP on port 2525 (including on Render Free).
    if (host) {
      const port = Number(this.env('SMTP_PORT') || 587);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('SMTP_PORT must be a valid TCP port.');
      }
      const secureSetting = this.env('SMTP_SECURE').toLowerCase();
      config.host = host;
      config.port = port;
      config.secure = secureSetting ? secureSetting === 'true' : port === 465;
      // Never silently send credentials over a plaintext SMTP connection.
      if (!config.secure) config.requireTLS = true;
    } else if (service) {
      config.service = service;
    }

    return config;
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport(
        this.getTransporterConfig(),
      );
    }

    return this.transporter;
  }

  /**
   * Check configuration before security-sensitive account operations.
   * SMTP verification tests connectivity, TLS and authentication, but does
   * not guarantee final inbox delivery. API providers are checked by an
   * actual send in scripts/email-smoke-test.js.
   */
  async verifyDeliveryConfiguration(force = false): Promise<Exclude<EmailProvider, 'none'>> {
    const provider = this.getProvider();
    if (provider === 'none') {
      throw new Error('No outbound email provider is configured.');
    }
    if (provider === 'smtp' && (force || Date.now() - this.smtpVerifiedAt > 60_000)) {
      await this.getTransporter().verify();
      this.smtpVerifiedAt = Date.now();
    }
    return provider;
  }

  private getFromAddress(): string {
    const configured = this.env('EMAIL_FROM') || this.env('SMTP_FROM');
    const smtpUser = this.env('SMTP_USER');
    const gmail = /gmail/i.test(this.env('SMTP_SERVICE') || this.env('SMTP_HOST'));

    // Gmail may silently rewrite an unverified From address. Use the
    // authenticated mailbox unless the operator explicitly configured and
    // verified a Gmail Send mail as alias.
    if (this.getProvider() === 'smtp' && gmail && smtpUser &&
        this.env('SMTP_ALLOW_VERIFIED_ALIAS').toLowerCase() !== 'true') {
      return `"NeuroOption" <${smtpUser}>`;
    }
    return configured || `"NeuroOption" <${smtpUser || 'no-reply@neurooption.com'}>`;
  }

  private parseFromAddress(): { name: string; email: string } {
    const from = this.getFromAddress();
    const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);

    if (match) {
      return { name: match[1].trim() || 'NeuroOption', email: match[2].trim() };
    }

    return { name: 'NeuroOption', email: from.trim() };
  }

  /** Absolute URL on the public site, e.g. appUrl('/verify-email?token=…'). */
  appUrl(path: string): string {
    return `${this.getFrontendUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private getFrontendUrl(): string {
    return (this.env('FRONTEND_URL') || DEFAULT_FRONTEND_URL).replace(
      /\/+$/,
      '',
    );
  }

  private getHostedLogoUrl(): string {
    return (
      this.env('EMAIL_LOGO_URL') ||
      `${this.getFrontendUrl()}/brand/neurooption-logo-email.png`
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private formatName(fullName?: string): string {
    const cleaned = fullName?.trim();
    return cleaned && cleaned.length > 0 ? cleaned : 'User';
  }

  private getSupportUrl(): string {
    return `${this.getFrontendUrl()}/help`;
  }

  // ---------------------------------------------------------------------------
  // Shared layout. Every email is rendered through brandedHtml(): light page
  // background, white card, official logo on a white cell, muted footer.
  // ---------------------------------------------------------------------------

  private brandedHtml(content: string, preheader = ''): string {
    const supportUrl = this.getSupportUrl();
    const year = new Date().getFullYear();

    return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>NeuroOption</title>
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
      a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
      @media only screen and (max-width: 620px) {
        .no-shell { padding: 16px 10px !important; }
        .no-pad { padding-left: 22px !important; padding-right: 22px !important; }
        .no-h1 { font-size: 23px !important; line-height: 30px !important; }
        .no-amount { font-size: 26px !important; line-height: 32px !important; }
        .no-code { font-size: 30px !important; letter-spacing: 6px !important; }
      }
      @media only screen and (max-width: 480px) {
        .no-btn { width: 100% !important; }
        .no-btn a { display: block !important; }
        .no-row td { display: block !important; width: 100% !important; text-align: left !important; }
        .no-row td.no-label { padding-bottom: 0 !important; border-bottom: 0 !important; }
        .no-row td.no-value { padding-top: 2px !important; }
      }
    </style>
  </head>
  <body bgcolor="${BRAND.page}" style="margin:0;padding:0;background-color:${BRAND.page};font-family:${FONT_STACK};color:${BRAND.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${this.escapeHtml(preheader)}${'&#8204;&nbsp;'.repeat(40)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${BRAND.page}" style="background-color:${BRAND.page};">
      <tr>
        <td align="center" class="no-shell" style="padding:32px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="${BRAND.card}" style="width:100%;max-width:600px;background-color:${BRAND.card};border:1px solid ${BRAND.divider};border-radius:16px;border-collapse:separate;overflow:hidden;">
            <tr>
              <td height="4" bgcolor="${BRAND.accent}" style="height:4px;line-height:4px;font-size:0;background-color:${BRAND.accent};background-image:${BRAND.gradient};">&nbsp;</td>
            </tr>
            <tr>
              <td align="center" bgcolor="#FFFFFF" style="padding:28px 24px 22px;background-color:#FFFFFF;border-bottom:1px solid ${BRAND.divider};">
                <a href="${this.getFrontendUrl()}" target="_blank" style="text-decoration:none;color:${BRAND.heading};">
                  <img src="${LOGO_SRC_PLACEHOLDER}" alt="NeuroOption" width="${EMAIL_LOGO_WIDTH}" height="${EMAIL_LOGO_HEIGHT}" border="0" style="display:block;width:${EMAIL_LOGO_WIDTH}px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;background-color:#FFFFFF;font-family:${FONT_STACK};font-size:26px;font-weight:700;color:${BRAND.heading};text-align:center;">
                </a>
              </td>
            </tr>
            <tr>
              <td class="no-pad" style="padding:32px 40px 34px;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${BRAND.text};">
${content}
              </td>
            </tr>
            <tr>
              <td class="no-pad" bgcolor="${BRAND.subtle}" style="padding:22px 40px 24px;background-color:${BRAND.subtle};border-top:1px solid ${BRAND.divider};font-family:${FONT_STACK};font-size:12px;line-height:19px;color:${BRAND.muted};">
                <p style="margin:0 0 8px;font-weight:700;color:${BRAND.heading};font-size:13px;">NeuroOption</p>
                <p style="margin:0 0 8px;">Need help? Visit the <a href="${supportUrl}" target="_blank" style="color:${BRAND.accent};text-decoration:underline;font-weight:600;">Support Center</a> or use the in-app Support chat.</p>
                <p style="margin:0 0 8px;">Secure account communications &bull; Never share verification codes or passwords with anyone. NeuroOption staff will never ask for them.</p>
                <p style="margin:0;">&copy; ${year} NeuroOption. All rights reserved. &bull; <a href="${this.getFrontendUrl()}" target="_blank" style="color:${BRAND.accent};text-decoration:none;">Open NeuroOption</a></p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-family:${FONT_STACK};font-size:11px;line-height:16px;color:${BRAND.muted};">You are receiving this email because of activity on your NeuroOption account.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }

  private textFooter(): string {
    return [
      '--',
      'NeuroOption',
      `Need help? Support Center: ${this.getSupportUrl()}`,
      'Secure account communications. Never share verification codes or passwords with anyone. NeuroOption staff will never ask for them.',
      `(c) ${new Date().getFullYear()} NeuroOption. All rights reserved.`,
    ].join('\n');
  }

  // --- Content building blocks (inline styles only) --------------------------

  private h1(text: string): string {
    return `<h1 class="no-h1" style="margin:0 0 12px;font-family:${FONT_STACK};font-size:26px;line-height:33px;font-weight:700;color:${BRAND.heading};">${this.escapeHtml(text)}</h1>`;
  }

  private h2(text: string): string {
    return `<h2 style="margin:26px 0 12px;font-family:${FONT_STACK};font-size:16px;line-height:22px;font-weight:700;color:${BRAND.heading};">${this.escapeHtml(text)}</h2>`;
  }

  /** Paragraph; `html` must already be escaped. */
  private p(html: string, muted = false): string {
    return `<p style="margin:0 0 14px;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${muted ? BRAND.muted : BRAND.text};">${html}</p>`;
  }

  private strong(text: string): string {
    return `<strong style="color:${BRAND.heading};font-weight:700;">${this.escapeHtml(text)}</strong>`;
  }

  private link(href: string, label: string): string {
    return `<a href="${this.escapeHtml(href)}" target="_blank" style="color:${BRAND.accent};text-decoration:underline;font-weight:600;">${this.escapeHtml(label)}</a>`;
  }

  /** Bulletproof table button: solid #0879AD fallback, brand gradient on top. */
  private button(href: string, label: string): string {
    const safeHref = this.escapeHtml(href);

    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" class="no-btn" style="margin:24px 0 6px;border-collapse:separate;">
  <tr>
    <td align="center" bgcolor="${BRAND.accent}" style="border-radius:10px;background-color:${BRAND.accent};background-image:${BRAND.gradient};mso-padding-alt:14px 30px;">
      <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:${FONT_STACK};font-size:15px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;">${this.escapeHtml(label)}&nbsp;&rarr;</a>
    </td>
  </tr>
</table>`;
  }

  private pill(label: string, tone: Tone): string {
    const t = TONES[tone];
    return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background-color:${t.bg};border:1px solid ${t.border};color:${t.fg};font-size:12px;line-height:18px;font-weight:700;letter-spacing:.02em;">${this.escapeHtml(label)}</span>`;
  }

  private eyebrow(text: string): string {
    return `<div style="margin:0 0 6px;font-family:${FONT_STACK};font-size:11px;line-height:16px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${BRAND.muted};">${this.escapeHtml(text)}</div>`;
  }

  /** Highlighted figure (amount, account email...). `value` is plain text. */
  private highlight(label: string, value: string, note = '', size = 28): string {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 22px;border-collapse:separate;">
  <tr>
    <td bgcolor="${BRAND.subtle}" style="padding:18px 20px;background-color:${BRAND.subtle};border:1px solid ${BRAND.divider};border-left:4px solid ${BRAND.accent};border-radius:12px;">
      ${this.eyebrow(label)}
      <div class="${size >= 24 ? 'no-amount' : ''}" style="font-family:${FONT_STACK};font-size:${size}px;line-height:${size + 6}px;font-weight:700;color:${BRAND.heading};word-break:break-word;">${this.escapeHtml(value)}</div>
      ${note ? `<div style="margin-top:6px;font-size:13px;line-height:20px;color:${BRAND.muted};">${note}</div>` : ''}
    </td>
  </tr>
</table>`;
  }

  /** One-time code box. */
  private codeBox(code: string): string {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 22px;border-collapse:separate;">
  <tr>
    <td align="center" bgcolor="${BRAND.subtle}" style="padding:22px 16px;background-color:${BRAND.subtle};border:1px dashed #B9D3E3;border-radius:12px;">
      ${this.eyebrow('Verification code')}
      <div class="no-code" style="font-family:'Courier New',Consolas,monospace;font-size:36px;line-height:44px;font-weight:700;letter-spacing:10px;color:${BRAND.heading};">${this.escapeHtml(code)}</div>
    </td>
  </tr>
</table>`;
  }

  /** Label/value table; the status row (if any) is rendered as a pill. */
  private detailsTable(
    title: string,
    rows: DetailRow[],
    status?: { label: string; tone: Tone },
  ): string {
    const cell = 'padding:11px 0;border-bottom:1px solid ' + BRAND.divider + ';font-family:' + FONT_STACK + ';font-size:14px;line-height:21px;';
    const row = (label: string, valueHtml: string) => `
    <tr class="no-row">
      <td class="no-label" width="42%" valign="top" style="${cell}color:${BRAND.muted};">${this.escapeHtml(label)}</td>
      <td class="no-value" valign="top" align="right" style="${cell}color:${BRAND.text};font-weight:600;text-align:right;word-break:break-all;">${valueHtml}</td>
    </tr>`;

    const body =
      rows.map(([label, value]) => row(label, this.escapeHtml(value))).join('') +
      (status ? row('Status', this.pill(status.label, status.tone)) : '');

    return `${this.h2(title)}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 8px;border-top:1px solid ${BRAND.divider};">${body}
</table>`;
  }

  /** Callout box; `html` must already be escaped. */
  private notice(title: string, html: string, tone: Tone = 'info'): string {
    const t = TONES[tone];
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 20px;border-collapse:separate;">
  <tr>
    <td bgcolor="${t.bg}" style="padding:14px 18px;background-color:${t.bg};border:1px solid ${t.border};border-left:4px solid ${t.fg};border-radius:10px;font-family:${FONT_STACK};font-size:14px;line-height:22px;color:${BRAND.text};">
      <div style="margin:0 0 4px;font-weight:700;color:${t.fg};">${this.escapeHtml(title)}</div>
      ${html}
    </td>
  </tr>
</table>`;
  }

  private divider(): string {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 18px;"><tr><td height="1" bgcolor="${BRAND.divider}" style="height:1px;line-height:1px;font-size:0;background-color:${BRAND.divider};">&nbsp;</td></tr></table>`;
  }

  private signOff(): string {
    return this.p(
      `Thank you for choosing NeuroOption.<br>${this.strong('The NeuroOption Team')}`,
    );
  }

  /** "Get help" section shared by account and money emails. */
  private helpBlock(text: string): string {
    return `${this.divider()}
<p style="margin:0;font-family:${FONT_STACK};font-size:13px;line-height:21px;color:${BRAND.muted};">${this.strong('Get help')}<br>${this.escapeHtml(text)} ${this.link(this.getSupportUrl(), 'Contact Support')}</p>`;
  }

  private textDetails(title: string, rows: DetailRow[]): string {
    return [title, ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');
  }

  private toHtml(body: string): string {
    const paragraphs = body
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => this.p(this.escapeHtml(line)))
      .join('');

    return this.brandedHtml(paragraphs);
  }

  private async postJson(
    url: string,
    headers: Record<string, string>,
    payload: unknown,
  ): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(HTTP_API_TIMEOUT_MS),
      });
    } catch (error) {
      // Network errors and timeouts are worth retrying.
      throw new DeliveryError(`Network error: ${error instanceof Error ? error.message : String(error)}`, false);
    }

    if (!response.ok) {
      const detail = (await response.text().catch(() => '')).slice(0, 300);
      // 408 / 429 / 5xx are temporary; other 4xx (bad key, unverified sender,
      // invalid address) will fail the same way every time.
      const temporary = response.status === 408 || response.status === 429 || response.status >= 500;
      throw new DeliveryError(`HTTP ${response.status} ${detail}`.trim(), !temporary);
    }
    return ((await response.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
  }

  private async deliver(
    provider: Exclude<EmailProvider, 'none'>,
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<string | null> {
    if (provider === 'smtp') {
      let receipt: { accepted?: Array<string | { address: string }>; messageId?: string };
      try {
        receipt = await this.getTransporter().sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        text,
        html: html.split(LOGO_SRC_PLACEHOLDER).join(`cid:${EMAIL_LOGO_CID}`),
        attachments: [
          {
            filename: EMAIL_LOGO_FILENAME,
            content: Buffer.from(EMAIL_LOGO_BASE64, 'base64'),
            contentType: EMAIL_LOGO_MIME,
            cid: EMAIL_LOGO_CID,
          },
        ],
        });
      } catch (error) {
        // SMTP 5xx replies are permanent; 4xx and connection problems are not.
        const code = Number((error as { responseCode?: number }).responseCode || 0);
        throw new DeliveryError(error instanceof Error ? error.message : String(error), code >= 500 && code < 600);
      }
      const accepted = (receipt.accepted ?? []).map((a) => (typeof a === 'string' ? a : a.address).toLowerCase());
      if (!accepted.includes(to.toLowerCase())) {
        throw new DeliveryError('SMTP did not accept the recipient address.', true);
      }
      return receipt.messageId ?? null;
    }

    const hostedHtml = html
      .split(LOGO_SRC_PLACEHOLDER)
      .join(this.getHostedLogoUrl());

    if (provider === 'brevo') {
      const result = await this.postJson(
        'https://api.brevo.com/v3/smtp/email',
        { 'api-key': this.env('BREVO_API_KEY'), accept: 'application/json' },
        {
          sender: this.parseFromAddress(),
          to: [{ email: to }],
          subject,
          htmlContent: hostedHtml,
          textContent: text,
        },
      );
      return typeof result.messageId === 'string' ? result.messageId : null;
    }

    const result = await this.postJson(
      'https://api.resend.com/emails',
      { Authorization: `Bearer ${this.env('RESEND_API_KEY')}` },
      {
        from: this.getFromAddress(),
        to: [to],
        subject,
        html: hostedHtml,
        text,
      },
    );
    return typeof result.id === 'string' ? result.id : null;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** One send with quick in-process retries for temporary failures. */
  private async attemptDelivery(to: string, subject: string, text: string, html: string): Promise<DeliveryResult & { attempts: number }> {
    const provider = this.getProvider();
    if (provider === 'none') throw new DeliveryError('No outbound email provider is configured.', true);
    let attempts = 0;
    for (;;) {
      attempts += 1;
      try {
        const messageId = await this.deliver(provider, to, subject, text, html);
        return { provider, messageId, attempts };
      } catch (error) {
        if (provider === 'smtp') this.smtpVerifiedAt = 0;
        const permanent = error instanceof DeliveryError ? error.permanent : false;
        const delay = IN_PROCESS_RETRY_DELAYS_MS[attempts - 1];
        if (permanent || delay === undefined) {
          const wrapped = error instanceof DeliveryError ? error : new DeliveryError(String(error), false);
          (wrapped as DeliveryError & { attempts?: number }).attempts = attempts;
          throw wrapped;
        }
        await this.sleep(delay);
      }
    }
  }

  /**
   * Sends one email and records it. Resolves true only when the provider
   * accepted it now (acceptance is not inbox delivery). Never throws: a
   * failed email must not undo the account or payment operation that
   * triggered it. Temporary failures of non-sensitive emails are retried
   * in the background.
   */
  private async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
    options: SendOptions = {},
  ): Promise<boolean> {
    const kind = options.kind ?? 'generic';
    const text = `${body}\n\n${this.textFooter()}`;
    const fullHtml = html || this.toHtml(body);

    if (this.getProvider() === 'none') {
      this.logger.warn(`Email provider unavailable; kind=${kind}, recipient=${this.recipientTag(to)}.`);
      await this.track(() => this.prisma!.emailMessage.create({
        data: { kind, dedupeKey: options.dedupeKey, userId: options.userId ?? null, recipient: to, subject, status: 'FAILED', lastError: 'No email provider configured.' },
      }));
      return false;
    }

    // Duplicate protection: one email per event.
    let recordId: string | null = null;
    if (options.dedupeKey && this.prisma) {
      const existing = await this.track(() => this.prisma!.emailMessage.findUnique({ where: { dedupeKey: options.dedupeKey } }));
      if (existing && existing.status !== 'FAILED') {
        this.logger.log(`Skipped duplicate ${kind}; dedupeKey already ${existing.status.toLowerCase()}.`);
        return existing.status !== 'QUEUED';
      }
      recordId = existing?.id ?? null;
    }

    const record = await this.track(() => recordId
      ? this.prisma!.emailMessage.update({ where: { id: recordId! }, data: { status: 'SENDING', attempts: 0, lastError: null, subject } })
      : this.prisma!.emailMessage.create({
        data: { kind, dedupeKey: options.dedupeKey, userId: options.userId ?? null, recipient: to, subject, status: 'SENDING', retryable: !options.sensitive },
      }));

    // Another request won the race for this dedupe key: it sends, we don't.
    if (!record && options.dedupeKey && this.prisma) {
      const winner = await this.track(() => this.prisma!.emailMessage.findUnique({ where: { dedupeKey: options.dedupeKey } }));
      if (winner) return winner.status !== 'FAILED' && winner.status !== 'QUEUED';
    }

    try {
      const result = await this.attemptDelivery(to, subject, text, fullHtml);
      this.logger.log(`Provider accepted ${kind} "${subject}"; recipient=${this.recipientTag(to)} via ${result.provider}${result.messageId ? ' (message id recorded)' : ''}; inbox delivery unverified.`);
      if (record) {
        await this.track(() => this.prisma!.emailMessage.update({
          where: { id: record.id },
          data: { status: 'ACCEPTED', provider: result.provider, providerMessageId: result.messageId, attempts: result.attempts, acceptedAt: new Date(), lastError: null, textBody: null, htmlBody: null, nextAttemptAt: null },
        }));
      }
      return true;
    } catch (error) {
      const permanent = error instanceof DeliveryError && error.permanent;
      const attempts = (error as { attempts?: number }).attempts ?? 1;
      const reason = this.errorMessage(error);
      const willRetry = !permanent && !options.sensitive && Boolean(record);
      this.logger.error(
        `Provider ${permanent ? 'rejected' : 'failed temporarily on'} ${kind} "${subject}"; recipient=${this.recipientTag(to)} via ${this.getProvider()}: ${reason}${willRetry ? ' (queued for retry)' : ''}`,
      );
      if (record) {
        await this.track(() => this.prisma!.emailMessage.update({
          where: { id: record.id },
          data: willRetry
            ? { status: 'QUEUED', attempts, lastError: reason, textBody: text, htmlBody: fullHtml, nextAttemptAt: new Date(Date.now() + WORKER_BACKOFF_MS[0]) }
            : { status: 'FAILED', attempts, lastError: reason, textBody: null, htmlBody: null, nextAttemptAt: null },
        }));
      }
      return false;
    }
  }

  /** Database bookkeeping must never break sending. */
  private async track<T>(operation: () => Promise<T>): Promise<T | null> {
    if (!this.prisma) return null;
    try {
      return await operation();
    } catch (error) {
      this.logger.warn(`Email tracking unavailable: ${this.errorMessage(error)}`);
      return null;
    }
  }

  /**
   * Retries queued emails whose wait is over. Rows are claimed with a
   * conditional update, so several instances never send the same email.
   */
  async processRetryQueue(now = new Date()): Promise<number> {
    if (!this.prisma || this.workerBusy || this.getProvider() === 'none') return 0;
    this.workerBusy = true;
    let sent = 0;
    try {
      // A crash mid-send leaves rows in SENDING; requeue the retryable ones.
      await this.prisma.emailMessage.updateMany({
        where: { status: 'SENDING', retryable: true, textBody: { not: null }, updatedAt: { lt: new Date(now.getTime() - STALE_SENDING_MS) } },
        data: { status: 'QUEUED', nextAttemptAt: now },
      });
      const due = await this.prisma.emailMessage.findMany({
        where: { status: 'QUEUED', nextAttemptAt: { lte: now } },
        orderBy: { nextAttemptAt: 'asc' },
        take: 20,
      });
      for (const row of due) {
        const claim = await this.prisma.emailMessage.updateMany({ where: { id: row.id, status: 'QUEUED' }, data: { status: 'SENDING' } });
        if (claim.count === 0 || !row.textBody || !row.htmlBody) continue;
        try {
          const result = await this.attemptDelivery(row.recipient, row.subject, row.textBody, row.htmlBody);
          await this.prisma.emailMessage.update({
            where: { id: row.id },
            data: { status: 'ACCEPTED', provider: result.provider, providerMessageId: result.messageId, attempts: row.attempts + result.attempts, acceptedAt: new Date(), lastError: null, textBody: null, htmlBody: null, nextAttemptAt: null },
          });
          this.logger.log(`Retry accepted ${row.kind}; recipient=${this.recipientTag(row.recipient)} after ${row.attempts + result.attempts} attempts.`);
          sent += 1;
        } catch (error) {
          const attempts = row.attempts + ((error as { attempts?: number }).attempts ?? 1);
          const permanent = error instanceof DeliveryError && error.permanent;
          const step = WORKER_BACKOFF_MS[Math.min(attempts - IN_PROCESS_RETRY_DELAYS_MS.length - 1, WORKER_BACKOFF_MS.length - 1)] ?? WORKER_BACKOFF_MS[WORKER_BACKOFF_MS.length - 1];
          const giveUp = permanent || attempts >= MAX_TOTAL_ATTEMPTS;
          await this.prisma.emailMessage.update({
            where: { id: row.id },
            data: giveUp
              ? { status: 'FAILED', attempts, lastError: this.errorMessage(error), textBody: null, htmlBody: null, nextAttemptAt: null }
              : { status: 'QUEUED', attempts, lastError: this.errorMessage(error), nextAttemptAt: new Date(Date.now() + step) },
          });
          this.logger.error(`Retry ${giveUp ? 'gave up on' : 'failed for'} ${row.kind}; recipient=${this.recipientTag(row.recipient)}: ${this.errorMessage(error)}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Email retry worker skipped a run: ${this.errorMessage(error)}`);
    } finally {
      this.workerBusy = false;
    }
    return sent;
  }

  /**
   * Applies a delivery event from the provider's webhook (delivered, bounce,
   * spam complaint) to the recorded message. Unknown ids are ignored.
   */
  async applyProviderEvent(event: string, messageId: string): Promise<boolean> {
    if (!this.prisma || !messageId) return false;
    const name = event.toLowerCase();
    const status =
      name === 'delivered' ? 'DELIVERED'
        : ['hard_bounce', 'hardbounce', 'invalid_email', 'blocked', 'error'].includes(name) ? 'BOUNCED'
          : ['spam', 'complaint'].includes(name) ? 'COMPLAINED'
            : null;
    const result = await this.prisma.emailMessage.updateMany({
      where: { providerMessageId: messageId },
      data: {
        lastEvent: name.slice(0, 40),
        ...(status ? { status } : {}),
        ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });
    return result.count > 0;
  }

  // ---------------------------------------------------------------------------
  // Account emails
  // ---------------------------------------------------------------------------

  accountCreated(email: string, fullName: string, verifyUrl?: string): EmailTemplate {
    const name = this.formatName(fullName);
    const loginUrl = `${this.getFrontendUrl()}/login`;

    const body = `
Dear ${name},

Welcome to NeuroOption! Your account has been created successfully and is ready to use.
Account email: ${email}
${verifyUrl ? `\nPlease confirm this is your email address (link valid for 24 hours):\n${verifyUrl}\n` : ''}
Here is how to get started:
1. Sign in and practise risk-free on your demo account to get familiar with the platform.
2. Fund your real account from the Finance section whenever you are ready to trade.
3. Complete identity verification (KYC) in your profile so withdrawals are processed without delays.

For your security, never share your password or verification codes with anyone. NeuroOption staff will never ask for them.
If you did not create this account, please contact Support Service immediately.

Sign in: ${loginUrl}

Thank you for choosing NeuroOption.
The NeuroOption Team
    `.trim();

    const step = (num: number, title: string, text: string) => `
    <tr>
      <td width="40" valign="top" style="padding:0 0 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
          <td width="28" height="28" align="center" valign="middle" bgcolor="${BRAND.accent}" style="width:28px;height:28px;border-radius:14px;background-color:${BRAND.accent};background-image:${BRAND.gradient};color:#FFFFFF;font-family:${FONT_STACK};font-size:13px;line-height:28px;font-weight:700;text-align:center;">${num}</td>
        </tr></table>
      </td>
      <td valign="top" style="padding:3px 0 16px;font-family:${FONT_STACK};font-size:14px;line-height:22px;color:${BRAND.muted};">
        ${this.strong(title)}<br>${this.escapeHtml(text)}
      </td>
    </tr>`;

    const html = this.brandedHtml(
      `
${this.h1(`Welcome to NeuroOption, ${name}!`)}
${this.p("Your account has been created successfully and is ready to use. We're glad to have you on board.", true)}
${this.highlight('Account email', email, '', 17)}
${verifyUrl ? `${this.p('Please confirm this is your email address. The link is valid for 24 hours.')}${this.button(verifyUrl, 'Verify my email')}${this.p(`If the button does not work, paste this link into your browser:<br>${this.link(verifyUrl, verifyUrl)}`, true)}` : ''}
${this.h2('How to get started')}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 4px;">
  ${step(1, 'Practise on your demo account', 'Sign in and explore OTC markets, charts and trade controls risk-free.')}
  ${step(2, 'Fund your real account', 'Make a deposit from the Finance section whenever you are ready to trade.')}
  ${step(3, 'Verify your identity', 'Complete KYC in your profile so withdrawals are processed without delays.')}
</table>
${verifyUrl ? '' : this.button(loginUrl, 'Sign in to NeuroOption')}
${this.divider()}
${this.p('For your security, never share your password or verification codes with anyone &mdash; NeuroOption staff will never ask for them. If you did not create this account, please contact Support Service immediately.', true)}
${this.signOff()}`,
      'Your NeuroOption account is ready. Here is how to get started.',
    );

    return {
      subject: 'Welcome to NeuroOption - your account is ready',
      body,
      html,
    };
  }

  /** "9 October 2026, 14:05:09 EAT (UTC+3)" for a UTC instant. */
  private formatEat(date: Date): string {
    const text = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'long',
      timeStyle: 'medium',
      timeZone: 'Africa/Nairobi',
    }).format(date);
    return `${text} EAT (UTC+3)`;
  }

  private bulletList(items: string[]): string {
    const rows = items
      .map(
        (item) =>
          `<li style="margin:0 0 8px;font-family:${FONT_STACK};font-size:14px;line-height:22px;color:${BRAND.text};">${this.escapeHtml(item)}</li>`,
      )
      .join('');
    return `<ul style="margin:0 0 6px;padding:0 0 0 20px;">${rows}</ul>`;
  }

  /**
   * Confirmation sent after an account is closed: what happened, what was
   * removed, what is kept and why, and what to do if it was not the owner.
   */
  accountDeletionConfirmed(data: AccountDeletionEmailData): EmailTemplate {
    const name = this.formatName(data.fullName);
    const closedAt = this.formatEat(data.deletedAt);
    const closedAtUtc = data.deletedAt.toISOString();
    const supportUrl = this.getSupportUrl();
    const registerUrl = `${this.getFrontendUrl()}/register`;

    const removed = [
      'Your sign-in access. Every active session was signed out and can no longer be used.',
      'Your name, email address and phone number were removed from your profile.',
      'Any password-reset codes and your referral code were cleared.',
      'Copy-trading follows and any affiliate profile were switched off.',
    ];
    const kept = [
      'Records of your deposits, withdrawals, trades and ledger entries, which we must keep to meet accounting, audit and anti-money-laundering obligations.',
      'Identity-verification (KYC) records, if you submitted any.',
      'A record of this deletion request.',
    ];

    const rows: DetailRow[] = [
      ['Account email', data.email],
      ['Account closed', closedAt],
      ['Closed at (UTC)', closedAtUtc],
      ['Funds at closing', 'No balance or open trades'],
    ];
    if (data.reasonLabel) rows.push(['Reason you gave', data.reasonLabel]);

    const body = `
Dear ${name},

This email confirms that your NeuroOption account has been deleted at your request. Please keep it as your record.

Reference: ${data.reference}
Account email: ${data.email}
Account closed: ${closedAt}
Closed at (UTC): ${closedAtUtc}
Funds at closing: none (no balance and no open trades or pending payments)${data.reasonLabel ? `\nReason you gave: ${data.reasonLabel}` : ''}

What we removed or switched off
${removed.map((item) => `- ${item}`).join('\n')}

What we keep, and why
${kept.map((item) => `- ${item}`).join('\n')}
These records are kept securely for as long as the law requires, are used only where the law requires it (for example audits or requests from regulators), and are never used for marketing.

Coming back
You can create a new account with the same email address at any time. A new account starts fresh: your previous balances, history and settings are not restored. Register again: ${registerUrl}

Did you not ask for this?
Contact Support immediately and quote reference ${data.reference}: ${supportUrl}

We will not send you further emails about this account, other than replies to messages you send to Support.

Thank you for having used NeuroOption.
The NeuroOption Team
    `.trim();

    const html = this.brandedHtml(
      `
${this.h1('Your account has been deleted')}
${this.p(`Dear ${this.escapeHtml(name)},`)}
${this.p('This email confirms that your NeuroOption account was deleted at your request. Please keep it as your record.')}
${this.highlight('Deletion reference', data.reference, 'Quote this if you contact Support about this deletion.', 24)}
${this.detailsTable('Deletion details', rows, { label: 'Closed', tone: 'success' })}
${this.h2('What we removed or switched off')}
${this.bulletList(removed)}
${this.h2('What we keep, and why')}
${this.bulletList(kept)}
${this.p('These records are kept securely for as long as the law requires, are used only where the law requires it (for example audits or requests from regulators), and are never used for marketing.', true)}
${this.h2('Coming back')}
${this.p('You can create a new account with the same email address at any time. A new account starts fresh: your previous balances, history and settings are not restored.')}
${this.button(registerUrl, 'Create a new account')}
${this.notice('Did you not ask for this?', `Contact Support immediately and quote reference ${this.escapeHtml(data.reference)} so we can investigate. ${this.link(supportUrl, 'Contact Support')}`, 'danger')}
${this.p('We will not send you further emails about this account, other than replies to messages you send to Support.', true)}
${this.signOff()}`,
      'Your NeuroOption account has been deleted. Here are the details.',
    );

    return { subject: 'Your NeuroOption account has been deleted', body, html };
  }

  passwordRecoveryCode(code: string, fullName = 'User'): EmailTemplate {
    const name = this.formatName(fullName);

    const body = `
Dear ${name},

Your NeuroOption password recovery verification code is: ${code}
This code expires in 10 minutes.
If you did not request a password reset, you can ignore this email.
    `.trim();

    const html = this.brandedHtml(
      `
${this.h1('Password recovery')}
${this.p(`Hi ${this.escapeHtml(name)}, use the verification code below to reset your NeuroOption password.`)}
${this.codeBox(code)}
${this.p(`This code expires in ${this.strong('10 minutes')}. Never share it with anyone &mdash; NeuroOption staff will never ask for it.`)}
${this.p('If you did not request a password reset, you can ignore this email. Your password will stay the same.', true)}`,
      'Your NeuroOption password reset code is ready. It expires in 10 minutes.',
    );

    return { subject: 'Your NeuroOption verification code', body, html };
  }

  passwordChanged(fullName: string, changedAt: Date = new Date()): EmailTemplate {
    const name = this.formatName(fullName);
    const when = this.formatEat(changedAt);
    const resetUrl = `${this.getFrontendUrl()}/forgot-password`;

    const body = `
Dear ${name},

Your NeuroOption password was changed on ${when}.

If you made this change, no action is needed.
If you did NOT make this change, reset your password straight away (${resetUrl}) and contact Support: ${this.getSupportUrl()}
    `.trim();

    const html = this.brandedHtml(
      `
${this.h1('Your password was changed')}
${this.p(`Dear ${this.escapeHtml(name)},`)}
${this.p('The password for your NeuroOption account was just changed.')}
${this.highlight('Changed on', when, '', 15)}
${this.p('If you made this change, no action is needed.', true)}
${this.notice("Wasn't you?", `Reset your password straight away and contact Support so we can secure your account. ${this.link(resetUrl, 'Reset password')}`, 'danger')}
${this.button(this.getSupportUrl(), 'Contact Support')}`,
      'Your NeuroOption password was just changed.',
    );

    return { subject: 'Your NeuroOption password was changed', body, html };
  }

  /** Confirms the address belongs to the account holder. */
  emailVerification(fullName: string, verifyUrl: string): EmailTemplate {
    const name = this.formatName(fullName);
    const body = `
Dear ${name},

Please confirm your email address for NeuroOption by opening this link (valid for 24 hours):
${verifyUrl}

If you did not create a NeuroOption account, you can ignore this email.
    `.trim();
    const html = this.brandedHtml(
      `
${this.h1('Confirm your email address')}
${this.p(`Dear ${this.escapeHtml(name)},`)}
${this.p('Please confirm this is your email address so we can reach you about your account and payments. The link is valid for 24 hours and works once.')}
${this.button(verifyUrl, 'Verify my email')}
${this.p(`If the button does not work, paste this link into your browser:<br>${this.link(verifyUrl, verifyUrl)}`, true)}
${this.p('If you did not create a NeuroOption account, you can ignore this email.', true)}`,
      'Confirm your email address for NeuroOption.',
    );
    return { subject: 'Confirm your email address - NeuroOption', body, html };
  }

  /** Explicit operator-only CLI smoke test, never exposed as an HTTP endpoint. */
  async sendDeliveryTestEmail(email: string): Promise<boolean> {
    // Recorded like any other email (kind "test") so the log shows the result.
    const now = new Date().toISOString();
    const body = `NeuroOption outbound email test at ${now}. No user account was created, changed or deleted.`;
    return this.sendTemplateEmail(email, {
      subject: 'NeuroOption email connection test',
      body,
      html: this.brandedHtml(
        `${this.h1('Email connection test')}${this.p(this.escapeHtml(body))}`,
        'This is an SMTP/provider test, not an account notification.',
      ),
    }, { kind: 'test' });
  }

  async sendAccountCreatedEmail(email: string, fullName: string, options: SendOptions & { verifyUrl?: string } = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.accountCreated(email, fullName, options.verifyUrl), { kind: 'welcome', ...options, sensitive: options.sensitive ?? Boolean(options.verifyUrl) });
  }

  async sendEmailVerificationEmail(email: string, fullName: string, verifyUrl: string, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.emailVerification(fullName, verifyUrl), { kind: 'email_verification', ...options, sensitive: true });
  }

  /** Resolves false (never throws) when the email could not be delivered. */
  async sendAccountDeletionEmail(data: AccountDeletionEmailData, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(data.email, this.accountDeletionConfirmed(data), { kind: 'account_deleted', dedupeKey: `account-deleted:${data.reference}`, ...options });
  }

  async sendPasswordRecoveryCodeEmail(
    email: string,
    code: string,
    fullName = 'User',
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.passwordRecoveryCode(code, fullName), { kind: 'password_code', sensitive: true });
  }

  /** Sent to the client when an administrator replies to their support ticket. */
  supportReply(fullName: string, subject: string, reply: string, ticketId: string): EmailTemplate {
    const name = this.formatName(fullName);
    const ticketUrl = `${this.getFrontendUrl()}/support?ticket=${encodeURIComponent(ticketId)}`;
    const quoted = reply.length > 1500 ? `${reply.slice(0, 1500)}…` : reply;
    const body = `
Dear ${name},

NeuroOption Support replied to your ticket "${subject}":

${quoted}

Read the conversation and reply here: ${ticketUrl}
    `.trim();
    const html = this.brandedHtml(
      `
${this.h1('Support replied to your ticket')}
${this.p(`Dear ${this.escapeHtml(name)},`)}
${this.p(`Our support team replied to your ticket ${this.strong(subject)}:`)}
${this.notice('Reply from NeuroOption Support', this.escapeHtml(quoted).replace(/\n/g, '<br>'))}
${this.button(ticketUrl, 'Open the conversation')}
${this.p('You can reply from the same page. Please do not reply to this email.', true)}`,
      `Support replied to "${subject}".`,
    );
    return { subject: `Re: ${subject} - NeuroOption Support`, body, html };
  }

  async sendSupportReplyEmail(email: string, fullName: string, subject: string, reply: string, ticketId: string, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.supportReply(fullName, subject, reply, ticketId), { kind: 'support_reply', ...options });
  }

  /** Confirms a newsletter sign-up and carries the one-click unsubscribe link. */
  newsletterWelcome(unsubscribeToken: string): EmailTemplate {
    const unsubscribeUrl = `${this.getFrontendUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    const body = `
You're subscribed to NeuroOption updates: platform news, new markets and product improvements.

Didn't sign up, or changed your mind? Unsubscribe: ${unsubscribeUrl}
    `.trim();
    const html = this.brandedHtml(
      `
${this.h1("You're subscribed")}
${this.p('Thanks for subscribing to NeuroOption updates. We will email you about platform news, new markets and product improvements. No spam, and never more than a few emails a month.')}
${this.button(this.getFrontendUrl(), 'Visit NeuroOption')}
${this.p(`Didn't sign up, or changed your mind? ${this.link(unsubscribeUrl, 'Unsubscribe with one click')}.`, true)}`,
      'You are subscribed to NeuroOption updates.',
    );
    return { subject: "You're subscribed to NeuroOption updates", body, html };
  }

  async sendNewsletterWelcomeEmail(email: string, unsubscribeToken: string): Promise<boolean> {
    return this.sendTemplateEmail(email, this.newsletterWelcome(unsubscribeToken), { kind: 'newsletter_welcome', sensitive: true });
  }

  async sendPasswordChangedEmail(email: string, fullName: string, options: SendOptions & { changedAt?: Date } = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.passwordChanged(fullName, options.changedAt), { kind: 'password_changed', ...options });
  }

  // ---------------------------------------------------------------------------
  // Money emails
  // ---------------------------------------------------------------------------

  private money(data: MoneyEmailData): string {
    return `${data.amount} ${data.currency}`;
  }

  private moneyEmail(opts: {
    heading: string;
    intro: string;
    amountLabel: string;
    data: MoneyEmailData;
    explanation: string;
    detailsTitle: string;
    rows: DetailRow[];
    status?: { label: string; tone: Tone };
    reason?: string;
    help: string;
    preheader: string;
  }): string {
    const historyUrl = `${this.getFrontendUrl()}/finance?tab=history`;

    return this.brandedHtml(
      `
${this.h1(opts.heading)}
${this.p(this.escapeHtml(opts.intro))}
${opts.reason ? this.notice('Reason', this.escapeHtml(opts.reason), 'danger') : this.highlight(opts.amountLabel, this.money(opts.data), this.escapeHtml(opts.data.method))}
${opts.explanation ? this.p(this.escapeHtml(opts.explanation), true) : ''}
${this.detailsTable(opts.detailsTitle, opts.rows, opts.status)}
${this.button(historyUrl, 'View transaction history')}
${this.helpBlock(opts.help)}`,
      opts.preheader,
    );
  }

  depositSuccessful(data: MoneyEmailData): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['Transaction', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Payment Method', data.method],
      ['Amount', amount],
      ['Deposit amount', amount],
    ];
    const intro = `You have successfully funded your trading account with ${amount}.`;
    const explanation = `The ${data.method} deposit has been successfully processed and transferred to your trading account.`;

    return {
      subject: 'NeuroOption Deposit Successful',
      body: [
        intro,
        explanation,
        this.textDetails('Your Deposit', rows),
        `View transaction history: ${this.getFrontendUrl()}/finance?tab=history`,
      ].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Deposit successful',
        intro,
        amountLabel: 'Deposit amount',
        data,
        explanation,
        detailsTitle: 'Your Deposit',
        rows: rows.slice(0, 3),
        status: { label: 'Successful', tone: 'success' },
        help: 'Questions about this deposit?',
        preheader: `${amount} has been added to your NeuroOption trading account.`,
      }),
    };
  }

  /** Sent only after M-Pesa (or another gateway) reports the payment failed. */
  depositFailed(data: MoneyEmailData & { reason: string }): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['Transaction', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Payment Method', data.method],
      ['Amount', amount],
    ];
    const intro = `Your ${data.method} deposit of ${amount} was not completed.`;
    const explanation = `Reason given by the payment provider: ${data.reason}. No money was added to your trading account, and if anything was taken from your M-Pesa it will be reversed by the provider.`;
    return {
      subject: 'NeuroOption Deposit Not Completed',
      body: [intro, explanation, this.textDetails('Your Deposit', rows), `Try again: ${this.getFrontendUrl()}/finance`].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Deposit not completed',
        intro,
        amountLabel: 'Deposit amount',
        data,
        explanation,
        detailsTitle: 'Your Deposit',
        rows: rows.slice(0, 3),
        status: { label: 'Not completed', tone: 'danger' },
        help: 'Need help with this payment?',
        preheader: `Your ${amount} deposit was not completed. No money was added.`,
      }),
    };
  }

  withdrawalRequested(data: MoneyEmailData): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['ID', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Amount', amount],
      ['Withdrawal Method', data.method],
    ];
    const intro = `You have placed a withdrawal request for ${amount} via ${data.method}.`;
    const explanation =
      'The withdrawal has been successfully received and placed in the queue for processing. We will send another email notification as soon as the status changes.';
    const help =
      'If you did not place this request or made it by mistake, please contact Support Service as soon as possible.';

    return {
      subject: 'NeuroOption Withdrawal Request Received',
      body: [
        intro,
        explanation,
        `${this.textDetails('Your Withdrawal Request', rows)}\nStatus: Processed`,
        `Get Help\n${help}`,
        `View transaction history: ${this.getFrontendUrl()}/finance?tab=history`,
      ].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Withdrawal request received',
        intro,
        amountLabel: 'Withdrawal amount',
        data,
        explanation,
        detailsTitle: 'Your Withdrawal Request',
        rows,
        status: { label: 'Processed', tone: 'info' },
        help,
        preheader: `We received your withdrawal request for ${amount}.`,
      }),
    };
  }

  withdrawalProcessing(data: MoneyEmailData): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['ID', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Amount', amount],
      ['Withdrawal Method', data.method],
      ['Payment Amount', amount],
    ];
    const intro = `Your withdrawal of ${amount} using the ${data.method} method is being processed by the external provider.`;
    const explanation =
      'The withdrawal request has been forwarded to the financial provider for processing. This process may take some time.';
    const help = 'Contact the Support Service if you need any assistance.';

    return {
      subject: 'NeuroOption Withdrawal Processing',
      body: [
        intro,
        explanation,
        `${this.textDetails('Your Withdrawal Request', rows)}\nStatus: In process`,
        `Get Help\n${help}`,
        `View transaction history: ${this.getFrontendUrl()}/finance?tab=history`,
      ].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Withdrawal in process',
        intro,
        amountLabel: 'Withdrawal amount',
        data,
        explanation,
        detailsTitle: 'Your Withdrawal Request',
        rows,
        status: { label: 'In process', tone: 'info' },
        help,
        preheader: `Your ${amount} withdrawal is being processed.`,
      }),
    };
  }

  withdrawalCompleted(data: MoneyEmailData): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['ID', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Amount', amount],
      ['Withdrawal Method', data.method],
      ['Payment Amount', amount],
    ];
    const intro = `Your withdrawal of ${amount} using the ${data.method} method has been completed.`;
    const explanation =
      'The withdrawal request has been successfully processed by our financial provider. The time to receive the funds depends on the payment method.';
    const help = 'Contact the Support Service if you need any assistance.';

    return {
      subject: 'NeuroOption Withdrawal Completed',
      body: [
        intro,
        explanation,
        `${this.textDetails('Your Withdrawal Request', rows)}\nStatus: Completed`,
        `Get Help\n${help}`,
        `View transaction history: ${this.getFrontendUrl()}/finance?tab=history`,
      ].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Withdrawal completed',
        intro,
        amountLabel: 'Amount paid out',
        data,
        explanation,
        detailsTitle: 'Your Withdrawal Request',
        rows,
        status: { label: 'Completed', tone: 'success' },
        help,
        preheader: `Your ${amount} withdrawal has been completed.`,
      }),
    };
  }

  withdrawalDeclined(data: MoneyEmailData & { reason: string }): EmailTemplate {
    const amount = this.money(data);
    const rows: DetailRow[] = [
      ['ID', data.transactionId],
      ['Date & Time', data.dateTime],
      ['Amount', amount],
      ['Withdrawal Method', data.method],
    ];
    const intro =
      'Your withdrawal request has been declined after a careful review by the NeuroOption financial security system.';
    const help = 'Contact the Support Service if you need further clarification.';

    return {
      subject: 'NeuroOption Withdrawal Declined',
      body: [
        intro,
        `Reason:\n${data.reason}`,
        `${this.textDetails('Your Withdrawal Request', rows)}\nStatus: Declined`,
        `Get Help\n${help}`,
        `View transaction history: ${this.getFrontendUrl()}/finance?tab=history`,
      ].join('\n\n'),
      html: this.moneyEmail({
        heading: 'Withdrawal declined',
        intro,
        amountLabel: 'Withdrawal amount',
        data,
        explanation: '',
        detailsTitle: 'Your Withdrawal Request',
        rows,
        status: { label: 'Declined', tone: 'danger' },
        reason: data.reason,
        help,
        preheader: `Your ${amount} withdrawal request was declined.`,
      }),
    };
  }

  // ---------------------------------------------------------------------------
  // KYC emails
  // ---------------------------------------------------------------------------

  private kycEmail(opts: {
    name: string;
    heading: string;
    status: { label: string; tone: Tone };
    paragraphs: string[];
    reason?: string;
    after?: string;
    cta?: string;
    preheader: string;
  }): string {
    const profileUrl = `${this.getFrontendUrl()}/profile`;

    return this.brandedHtml(
      `
<div style="margin:0 0 14px;">${this.pill(opts.status.label, opts.status.tone)}</div>
${this.h1(opts.heading)}
${this.p(`Dear ${this.escapeHtml(opts.name)},`)}
${opts.paragraphs.map((text) => this.p(this.escapeHtml(text))).join('\n')}
${opts.reason ? this.notice('Reason', this.escapeHtml(opts.reason), 'danger') : ''}
${opts.after ? this.p(this.escapeHtml(opts.after), true) : ''}
${opts.cta ? this.button(profileUrl, opts.cta) : ''}
${this.divider()}
${this.p('Thank you for using NeuroOption.<br>' + this.strong('The NeuroOption Team'))}`,
      opts.preheader,
    );
  }

  kycSubmitted(fullName: string): EmailTemplate {
    const name = this.formatName(fullName);
    const paragraphs = [
      'Thank you for uploading your KYC documents.',
      'Our compliance team has received your documents and live face verification for careful review. We will notify you once the verification is complete.',
    ];

    return {
      subject: 'NeuroOption KYC Documents Received',
      body: [
        `Dear ${name},`,
        '',
        ...paragraphs,
        `Your account: ${this.getFrontendUrl()}/profile`,
        'Thank you for using NeuroOption.',
      ].join('\n'),
      html: this.kycEmail({
        name,
        heading: 'We received your KYC documents',
        status: { label: 'Under review', tone: 'info' },
        paragraphs,
        cta: 'View verification status',
        preheader: 'Your KYC documents are under review.',
      }),
    };
  }

  kycApproved(fullName: string): EmailTemplate {
    const name = this.formatName(fullName);
    const paragraphs = [
      'Your KYC verification has been approved.',
      'You may now continue using NeuroOption services, subject to the platform rules and compliance requirements.',
    ];

    return {
      subject: 'NeuroOption KYC Approved',
      body: [
        `Dear ${name},`,
        '',
        ...paragraphs,
        `Your account: ${this.getFrontendUrl()}/profile`,
        'Thank you for using NeuroOption.',
      ].join('\n'),
      html: this.kycEmail({
        name,
        heading: 'Your identity is verified',
        status: { label: 'Approved', tone: 'success' },
        paragraphs,
        cta: 'Go to your account',
        preheader: 'Your NeuroOption KYC verification has been approved.',
      }),
    };
  }

  kycRejected(fullName: string, reason: string): EmailTemplate {
    const name = this.formatName(fullName);
    const after =
      'Please upload clear and valid documents, and ensure your live face verification is visible and matches the submitted document.';

    return {
      subject: 'NeuroOption KYC Documents Rejected',
      body: [
        `Dear ${name},`,
        '',
        'Your KYC documents could not be approved.',
        '',
        `Reason:\n${reason}`,
        '',
        after,
        `Upload documents: ${this.getFrontendUrl()}/profile`,
        '',
        'Thank you for using NeuroOption.',
      ].join('\n'),
      html: this.kycEmail({
        name,
        heading: 'Action needed: re-upload your KYC documents',
        status: { label: 'Rejected', tone: 'danger' },
        paragraphs: ['Your KYC documents could not be approved.'],
        reason,
        after,
        cta: 'Upload documents again',
        preheader: 'Action needed: please re-upload your KYC documents.',
      }),
    };
  }

  async sendTemplateEmail(email: string, template: EmailTemplate, options: SendOptions = {}): Promise<boolean> {
    return this.sendEmail(email, template.subject, template.body, template.html, options);
  }

  async sendDepositSuccessfulEmail(email: string, data: MoneyEmailData, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.depositSuccessful(data), { kind: 'deposit_completed', dedupeKey: `deposit-completed:${data.transactionId}`, ...options });
  }

  async sendDepositFailedEmail(email: string, data: MoneyEmailData & { reason: string }, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.depositFailed(data), { kind: 'deposit_failed', dedupeKey: `deposit-failed:${data.transactionId}`, ...options });
  }

  async sendWithdrawalRequestedEmail(email: string, data: MoneyEmailData, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalRequested(data), { kind: 'withdrawal_requested', dedupeKey: `withdrawal-requested:${data.transactionId}`, ...options });
  }

  async sendWithdrawalProcessingEmail(email: string, data: MoneyEmailData, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalProcessing(data), { kind: 'withdrawal_processing', dedupeKey: `withdrawal-processing:${data.transactionId}`, ...options });
  }

  async sendWithdrawalCompletedEmail(email: string, data: MoneyEmailData, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalCompleted(data), { kind: 'withdrawal_completed', dedupeKey: `withdrawal-completed:${data.transactionId}`, ...options });
  }

  async sendWithdrawalDeclinedEmail(
    email: string,
    data: MoneyEmailData & { reason: string },
    options: SendOptions = {},
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalDeclined(data), { kind: 'withdrawal_declined', dedupeKey: `withdrawal-declined:${data.transactionId}`, ...options });
  }

  async sendKycSubmittedEmail(email: string, fullName: string, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycSubmitted(fullName), { kind: 'kyc_submitted', ...options });
  }

  async sendKycApprovedEmail(email: string, fullName: string, options: SendOptions = {}): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycApproved(fullName), { kind: 'kyc_approved', ...options });
  }

  async sendKycRejectedEmail(
    email: string,
    fullName: string,
    reason: string,
    options: SendOptions = {},
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycRejected(fullName, reason), { kind: 'kyc_rejected', ...options });
  }
}
