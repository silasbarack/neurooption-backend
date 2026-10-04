import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EMAIL_LOGO_CID, EMAIL_LOGO_PNG_BASE64 } from './email-logo';

type MoneyEmailData = {
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  dateTime: string;
};

type EmailTemplate = {
  subject: string;
  body: string;
};

type EmailProvider = 'brevo' | 'resend' | 'smtp' | 'none';

// Placeholder swapped for the real logo src per provider: an inline CID
// attachment over SMTP, a hosted URL for the HTTPS APIs.
const LOGO_SRC_PLACEHOLDER = '__NEUROOPTION_LOGO_SRC__';

const DEFAULT_FRONTEND_URL = 'https://neurooption-frontend.onrender.com';

// Render free web services block outbound SMTP ports 25/465/587, so an
// unreachable SMTP server must fail fast instead of hanging the request.
const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 20_000;
const HTTP_API_TIMEOUT_MS = 15_000;

@Injectable()
export class EmailsService implements OnModuleInit {
  private readonly logger = new Logger(EmailsService.name);
  private transporter: Transporter | null = null;

  onModuleInit() {
    const provider = this.getProvider();

    if (provider === 'none') {
      this.logger.warn(
        'Email is not configured. Set BREVO_API_KEY or RESEND_API_KEY (recommended on Render free plan), or SMTP_HOST/SMTP_SERVICE + SMTP_USER + SMTP_PASS.',
      );
      return;
    }

    this.logger.log(
      `Email provider: ${provider} (from ${this.getFromAddress()})`,
    );

    if (provider === 'smtp') {
      this.getTransporter()
        .verify()
        .then(() => this.logger.log('SMTP connection verified.'))
        .catch((error) =>
          this.logger.error(
            `SMTP connection check failed: ${this.errorMessage(error)}. ` +
              'If this runs on a Render free instance, SMTP ports are blocked; use BREVO_API_KEY or RESEND_API_KEY, or SMTP_PORT=2525 with a provider that supports it.',
          ),
        );
    }
  }

  private env(name: string): string {
    return (process.env[name] || '').trim();
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private getProvider(): EmailProvider {
    if (this.env('BREVO_API_KEY')) return 'brevo';
    if (this.env('RESEND_API_KEY')) return 'resend';

    const hasCredentials = !!this.env('SMTP_USER') && !!this.env('SMTP_PASS');
    const hasServer = !!this.env('SMTP_SERVICE') || !!this.env('SMTP_HOST');

    return hasCredentials && hasServer ? 'smtp' : 'none';
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
      tls: {
        rejectUnauthorized:
          (this.env('SMTP_REJECT_UNAUTHORIZED') || 'true').toLowerCase() ===
          'true',
      },
    };

    if (service) {
      config.service = service;
    } else {
      const port = Number(this.env('SMTP_PORT') || 587);
      const secureSetting = this.env('SMTP_SECURE').toLowerCase();

      config.host = host || 'smtp.gmail.com';
      config.port = port;
      // Port 465 is implicit TLS; others upgrade with STARTTLS.
      config.secure = secureSetting ? secureSetting === 'true' : port === 465;
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

  private getFromAddress(): string {
    return (
      this.env('EMAIL_FROM') ||
      this.env('SMTP_FROM') ||
      `"NeuroOption" <${this.env('SMTP_USER') || 'no-reply@neurooption.com'}>`
    );
  }

  private parseFromAddress(): { name: string; email: string } {
    const from = this.getFromAddress();
    const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);

    if (match) {
      return { name: match[1].trim() || 'NeuroOption', email: match[2].trim() };
    }

    return { name: 'NeuroOption', email: from.trim() };
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
      `${this.getFrontendUrl()}/neurooption-logo.png`
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

  private brandedHtml(content: string, preheader = ''): string {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
        </head>
        <body style="margin:0;padding:0;background:#f3f7fa;font-family:Arial,Helvetica,sans-serif;color:#183149;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${this.escapeHtml(preheader)}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f7fa;padding:28px 12px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe8ef;border-radius:18px;overflow:hidden;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding:26px 28px 22px;border-bottom:3px solid #13b9b2;background:#ffffff;">
                    <img src="${LOGO_SRC_PLACEHOLDER}" alt="NeuroOption" width="260" height="50" border="0" style="display:block;width:260px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;">
                  </td>
                </tr>
                <tr><td style="padding:32px 28px;">${content}</td></tr>
                <tr>
                  <td style="padding:18px 28px;background:#f8fbfd;border-top:1px solid #e8eff4;color:#8293a5;font-size:12px;line-height:1.6;">
                    &copy; NeuroOption. All rights reserved.<br>
                    Secure account communications &bull; Never share verification codes or passwords with anyone.
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;
  }

  private toHtml(body: string): string {
    const paragraphs = body
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map(
        (line) =>
          `<p style="margin:0 0 12px;line-height:1.7;">${this.escapeHtml(line)}</p>`,
      )
      .join('');

    return this.brandedHtml(paragraphs);
  }

  private async postJson(
    url: string,
    headers: Record<string, string>,
    payload: unknown,
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(HTTP_API_TIMEOUT_MS),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} ${detail}`.trim());
    }
  }

  private async deliver(
    provider: Exclude<EmailProvider, 'none'>,
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    if (provider === 'smtp') {
      await this.getTransporter().sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        text,
        html: html.split(LOGO_SRC_PLACEHOLDER).join(`cid:${EMAIL_LOGO_CID}`),
        attachments: [
          {
            filename: 'neurooption-logo.png',
            content: Buffer.from(EMAIL_LOGO_PNG_BASE64, 'base64'),
            contentType: 'image/png',
            cid: EMAIL_LOGO_CID,
          },
        ],
      });
      return;
    }

    const hostedHtml = html
      .split(LOGO_SRC_PLACEHOLDER)
      .join(this.getHostedLogoUrl());

    if (provider === 'brevo') {
      await this.postJson(
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
      return;
    }

    await this.postJson(
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
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<boolean> {
    const provider = this.getProvider();

    if (provider === 'none') {
      this.logger.warn(`Email is not configured. "${subject}" not sent to ${to}.`);
      return false;
    }

    try {
      await this.deliver(provider, to, subject, body, html || this.toHtml(body));
      this.logger.log(`Sent "${subject}" to ${to} via ${provider}.`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send "${subject}" to ${to} via ${provider}: ${this.errorMessage(error)}`,
      );

      if (error instanceof Error && error.stack) {
        this.logger.error(error.stack);
      }

      return false;
    }
  }

  async sendAccountCreatedEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    const name = this.formatName(fullName);
    const safeName = this.escapeHtml(name);
    const safeEmail = this.escapeHtml(email);
    const loginUrl = `${this.getFrontendUrl()}/login`;

    const body = `
Dear ${name},

Welcome to NeuroOption! Your account has been created successfully and is ready to use.
Account email: ${email}

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
        <td width="34" valign="top" style="padding:0 0 14px;">
          <div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:#0b8ec2;color:#ffffff;font-size:13px;font-weight:700;text-align:center;">${num}</div>
        </td>
        <td valign="top" style="padding:2px 0 14px;color:#536a80;font-size:14px;line-height:1.6;">
          <strong style="color:#10203a;">${title}</strong><br>${text}
        </td>
      </tr>`;

    const html = this.brandedHtml(`
      <h1 style="margin:0 0 10px;font-size:28px;color:#10203a;">Welcome to NeuroOption, ${safeName}!</h1>
      <p style="margin:0 0 18px;color:#66788e;line-height:1.7;">Your account has been created successfully and is ready to use. We're glad to have you on board.</p>
      <div style="padding:16px 18px;border-radius:14px;background:#edf9fc;border:1px solid #d5eef5;margin:0 0 24px;">
        <span style="display:block;font-size:11px;font-weight:700;letter-spacing:.14em;color:#6f8194;margin-bottom:4px;">ACCOUNT EMAIL</span>
        <strong style="color:#0b8ec2;font-size:16px;">${safeEmail}</strong>
      </div>
      <h2 style="margin:0 0 14px;font-size:17px;color:#10203a;">How to get started</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px;">
        ${step(1, 'Practise on your demo account', 'Sign in and explore OTC markets, charts and trade controls risk-free.')}
        ${step(2, 'Fund your real account', 'Make a deposit from the Finance section whenever you are ready to trade.')}
        ${step(3, 'Verify your identity', 'Complete KYC in your profile so withdrawals are processed without delays.')}
      </table>
      <a href="${loginUrl}" style="display:inline-block;padding:13px 24px;border-radius:10px;background:#0b8ec2;color:#ffffff;text-decoration:none;font-weight:700;">Sign in to NeuroOption</a>
      <p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #e8eff4;color:#8293a5;font-size:13px;line-height:1.6;">
        For your security, never share your password or verification codes with anyone &mdash; NeuroOption staff will never ask for them.
        If you did not create this account, please contact Support Service immediately.
      </p>
      <p style="margin:16px 0 0;color:#536a80;line-height:1.6;">Thank you for choosing NeuroOption.<br><strong style="color:#10203a;">The NeuroOption Team</strong></p>
    `, 'Your NeuroOption account is ready. Here is how to get started.');

    return this.sendEmail(
      email,
      'Welcome to NeuroOption - your account is ready',
      body,
      html,
    );
  }

  async sendAccountDeletedEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    const name = this.formatName(fullName);

    return this.sendEmail(
      email,
      'NeuroOption Account Deleted',
      `
Dear ${name},

Your NeuroOption account has been deleted successfully.
If you did not request this action, please contact Support Service immediately.
Thank you for using NeuroOption.
      `.trim(),
    );
  }

  async sendPasswordRecoveryCodeEmail(
    email: string,
    code: string,
    fullName = 'User',
  ): Promise<boolean> {
    const name = this.formatName(fullName);
    const safeName = this.escapeHtml(name);
    const body = `
Dear ${name},

Your NeuroOption password recovery verification code is: ${code}
This code expires in 10 minutes.
If you did not request a password reset, you can ignore this email.
    `.trim();

    const html = this.brandedHtml(`
      <h1 style="margin:0 0 10px;font-size:26px;color:#10203a;">Password recovery</h1>
      <p style="margin:0 0 18px;color:#66788e;line-height:1.7;">Hi ${safeName}, use the verification code below to reset your NeuroOption password.</p>
      <div style="margin:18px 0 22px;padding:20px;text-align:center;border-radius:14px;background:#f0f9fc;border:1px solid #d8eef5;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.16em;color:#6f8194;margin-bottom:8px;">VERIFICATION CODE</div>
        <div style="font-size:36px;font-weight:800;letter-spacing:.22em;color:#0b8ec2;">${code}</div>
      </div>
      <p style="margin:0;color:#66788e;line-height:1.7;">This code expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
    `, `Your NeuroOption verification code is ${code}`);

    return this.sendEmail(email, 'Your NeuroOption verification code', body, html);
  }

  async sendPasswordChangedEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    const name = this.formatName(fullName);

    return this.sendEmail(
      email,
      'Your NeuroOption password was changed',
      `
Dear ${name},

Your NeuroOption password was just changed successfully.
If you did not make this change, please contact Support Service immediately.
      `.trim(),
    );
  }

  depositSuccessful(data: MoneyEmailData): EmailTemplate {
    return {
      subject: 'NeuroOption Deposit Successful',
      body: `
You have successfully funded your trading account with ${data.amount} ${data.currency}.

The ${data.method} deposit has been successfully processed and transferred to your trading account.

Your Deposit

Transaction
${data.transactionId}

Date & Time
${data.dateTime}

Payment Method
${data.method}

Amount
${data.amount} ${data.currency}

Deposit amount
${data.amount} ${data.currency}
      `.trim(),
    };
  }

  withdrawalRequested(data: MoneyEmailData): EmailTemplate {
    return {
      subject: 'NeuroOption Withdrawal Request Received',
      body: `
You have placed a withdrawal request for ${data.amount} ${data.currency} via ${data.method}.

The withdrawal has been successfully received and placed in the queue for processing. We will send another email notification as soon as the status changes.

Your Withdrawal Request

ID
${data.transactionId}

Date & Time
${data.dateTime}

Amount
${data.amount} ${data.currency}

Withdrawal Method
${data.method}

Status
Processed

Get Help

If you did not place this request or made it by mistake, please contact Support Service as soon as possible.
      `.trim(),
    };
  }

  withdrawalProcessing(data: MoneyEmailData): EmailTemplate {
    return {
      subject: 'NeuroOption Withdrawal Processing',
      body: `
Your withdrawal of ${data.amount} ${data.currency} using the ${data.method} method is being processed by the external provider.

The withdrawal request has been forwarded to the financial provider for processing. This process may take some time.

Your Withdrawal Request

ID
${data.transactionId}

Date & Time
${data.dateTime}

Amount
${data.amount} ${data.currency}

Withdrawal Method
${data.method}

Payment Amount
${data.amount} ${data.currency}

Status
In process

Get Help

Contact the Support Service if you need any assistance.
      `.trim(),
    };
  }

  withdrawalCompleted(data: MoneyEmailData): EmailTemplate {
    return {
      subject: 'NeuroOption Withdrawal Completed',
      body: `
Your withdrawal of ${data.amount} ${data.currency} using the ${data.method} method has been completed.

The withdrawal request has been successfully processed by our financial provider. The time to receive the funds depends on the payment method.

Your Withdrawal Request

ID
${data.transactionId}

Date & Time
${data.dateTime}

Amount
${data.amount} ${data.currency}

Withdrawal Method
${data.method}

Payment Amount
${data.amount} ${data.currency}

Status
Completed

Get Help

Contact the Support Service if you need any assistance.
      `.trim(),
    };
  }

  withdrawalDeclined(
    data: MoneyEmailData & { reason: string },
  ): EmailTemplate {
    return {
      subject: 'NeuroOption Withdrawal Declined',
      body: `
Your withdrawal request has been declined after a careful review by the NeuroOption financial security system.

Reason:
${data.reason}

Your Withdrawal Request

ID
${data.transactionId}

Date & Time
${data.dateTime}

Amount
${data.amount} ${data.currency}

Withdrawal Method
${data.method}

Status
Declined

Get Help

Contact the Support Service if you need further clarification.
      `.trim(),
    };
  }

  kycSubmitted(fullName: string): EmailTemplate {
    const name = this.formatName(fullName);

    return {
      subject: 'NeuroOption KYC Documents Received',
      body: `
Dear ${name},

Thank you for uploading your KYC documents.
Our compliance team has received your documents and live face verification for careful review. We will notify you once the verification is complete.
Thank you for using NeuroOption.
      `.trim(),
    };
  }

  kycApproved(fullName: string): EmailTemplate {
    const name = this.formatName(fullName);

    return {
      subject: 'NeuroOption KYC Approved',
      body: `
Dear ${name},

Your KYC verification has been approved.
You may now continue using NeuroOption services, subject to the platform rules and compliance requirements.
Thank you for using NeuroOption.
      `.trim(),
    };
  }

  kycRejected(fullName: string, reason: string): EmailTemplate {
    const name = this.formatName(fullName);

    return {
      subject: 'NeuroOption KYC Documents Rejected',
      body: `
Dear ${name},

Your KYC documents could not be approved.

Reason:
${reason}

Please upload clear and valid documents, and ensure your live face verification is visible and matches the submitted document.

Thank you for using NeuroOption.
      `.trim(),
    };
  }

  async sendTemplateEmail(
    email: string,
    template: EmailTemplate,
  ): Promise<boolean> {
    return this.sendEmail(email, template.subject, template.body);
  }

  async sendDepositSuccessfulEmail(
    email: string,
    data: MoneyEmailData,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.depositSuccessful(data));
  }

  async sendWithdrawalRequestedEmail(
    email: string,
    data: MoneyEmailData,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalRequested(data));
  }

  async sendWithdrawalProcessingEmail(
    email: string,
    data: MoneyEmailData,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalProcessing(data));
  }

  async sendWithdrawalCompletedEmail(
    email: string,
    data: MoneyEmailData,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalCompleted(data));
  }

  async sendWithdrawalDeclinedEmail(
    email: string,
    data: MoneyEmailData & { reason: string },
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.withdrawalDeclined(data));
  }

  async sendKycSubmittedEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycSubmitted(fullName));
  }

  async sendKycApprovedEmail(
    email: string,
    fullName: string,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycApproved(fullName));
  }

  async sendKycRejectedEmail(
    email: string,
    fullName: string,
    reason: string,
  ): Promise<boolean> {
    return this.sendTemplateEmail(email, this.kycRejected(fullName, reason));
  }
}