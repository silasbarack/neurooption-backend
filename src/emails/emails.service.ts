import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  private getTransporterConfig() {
    const config: any = {
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized:
          String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() ===
          'true',
      },
    };

    if (process.env.SMTP_SERVICE) {
      config.service = process.env.SMTP_SERVICE;
    } else {
      config.host = process.env.SMTP_HOST || 'smtp.gmail.com';
      config.port = Number(process.env.SMTP_PORT || 587);
      config.secure =
        String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    }

    return config;
  }

  private createTransporter() {
    return nodemailer.createTransport(this.getTransporterConfig());
  }

  private isConfigured(): boolean {
    const hasCredentials = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
    const hasServer = !!process.env.SMTP_SERVICE || !!process.env.SMTP_HOST;

    return hasCredentials && hasServer;
  }

  private getFromAddress(): string {
    return (
      process.env.SMTP_FROM ||
      `"NeuroOption" <${process.env.SMTP_USER || 'no-reply@neurooption.com'}>`
    );
  }

  private formatName(fullName?: string): string {
    const cleaned = fullName?.trim();
    return cleaned && cleaned.length > 0 ? cleaned : 'User';
  }

  private brandedHtml(content: string, preheader = ''): string {
    const logoUrl =
      process.env.EMAIL_LOGO_URL ||
      'https://neurooption-frontend.onrender.com/neurooption-logo.jpg';

    return `
      <!doctype html>
      <html>
        <body style="margin:0;background:#f3f7fa;font-family:Arial,sans-serif;color:#183149;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fa;padding:28px 12px;">
            <tr><td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dfe8ef;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(34,67,98,.08);">
                <tr>
                  <td align="center" style="padding:24px 28px;border-bottom:1px solid #e8eff4;background:#ffffff;">
                    <img src="${logoUrl}" alt="NeuroOption" width="230" style="display:block;width:230px;max-width:75%;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;">
                  </td>
                </tr>
                <tr><td style="padding:32px 28px;">${content}</td></tr>
                <tr>
                  <td style="padding:18px 28px;background:#f8fbfd;border-top:1px solid #e8eff4;color:#8293a5;font-size:12px;line-height:1.6;">
                    © NeuroOption. All rights reserved.<br>
                    Secure account communications • Never share verification codes or passwords with anyone.
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
      .map((line) => `<p style="margin:0 0 12px;line-height:1.7;">${line}</p>`)
      .join('');

    return this.brandedHtml(paragraphs);
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
    html?: string,
  ): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        this.logger.warn('SMTP is not configured. Email not sent.');
        return false;
      }

      await this.createTransporter().sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        text: body,
        html: html || this.toHtml(body),
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);

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

    const body = `
Dear ${name},

Welcome to NeuroOption. Your account has been created successfully.
You can now sign in and access your trading dashboard.
Thank you for choosing NeuroOption.
    `.trim();

    const html = this.brandedHtml(`
      <h1 style="margin:0 0 10px;font-size:28px;color:#10203a;">Welcome to NeuroOption</h1>
      <p style="margin:0 0 20px;color:#66788e;line-height:1.7;">Hi ${name}, your account has been created successfully.</p>
      <div style="padding:18px;border-radius:14px;background:#edf9fc;border:1px solid #d5eef5;margin:0 0 22px;">
        <strong style="display:block;color:#0b8ec2;margin-bottom:6px;">Your trading account is ready</strong>
        <span style="color:#536a80;line-height:1.6;">Sign in to explore your dashboard, OTC markets and account controls.</span>
      </div>
      <a href="${process.env.FRONTEND_URL || 'https://neurooption-frontend.onrender.com'}/login" style="display:inline-block;padding:13px 22px;border-radius:10px;background:#0b8ec2;color:#ffffff;text-decoration:none;font-weight:700;">Sign in to NeuroOption</a>
    `, 'Your NeuroOption account has been created successfully.');

    return this.sendEmail(email, 'Welcome to NeuroOption', body, html);
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
    const body = `
Dear ${name},

Your NeuroOption password recovery verification code is: ${code}
This code expires in 10 minutes.
If you did not request a password reset, you can ignore this email.
    `.trim();

    const html = this.brandedHtml(`
      <h1 style="margin:0 0 10px;font-size:26px;color:#10203a;">Password recovery</h1>
      <p style="margin:0 0 18px;color:#66788e;line-height:1.7;">Hi ${name}, use the verification code below to reset your NeuroOption password.</p>
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