import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  MailContent, LOGO_CID, welcomeEmail, passwordResetCodeEmail, passwordChangedEmail, accountDeletedEmail,
} from './mail.templates';

const LOGO_PATH = join(__dirname, 'assets', 'neurooption-logo.png');

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private from: string;
  private appUrl: string;
  private enabled = false;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get('SMTP_PORT', 587));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    // Port 465 uses implicit TLS; 587/25 upgrade via STARTTLS.
    const secure = this.config.get('SMTP_SECURE') != null
      ? String(this.config.get('SMTP_SECURE')).toLowerCase() === 'true'
      : port === 465;

    this.from = this.config.get('MAIL_FROM') || (user ? `NeuroOption <${user}>` : 'NeuroOption <noreply@neurooption.com>');
    this.appUrl = (this.config.get('APP_URL', 'http://localhost:3000') as string).replace(/\/+$/, '');

    if (!host) {
      this.logger.warn('SMTP_HOST is not set – emails will NOT be delivered (logged to console only).');
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host, port, secure,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
    this.enabled = true;

    try {
      await this.transporter.verify();
      if (!existsSync(LOGO_PATH)) this.logger.warn(`Email logo not found at ${LOGO_PATH}; emails will show alt text.`);
      this.logger.log(`SMTP connection verified (${host}:${port}, secure=${secure}).`);
    } catch (err) {
      this.logger.error(`SMTP verification failed for ${host}:${port}: ${err.message}. Check SMTP_* settings.`);
    }
  }

  get frontendUrl() { return this.appUrl; }

  /** Sends an email. Returns true when the SMTP server accepted the recipient. */
  async send(to: string, content: MailContent): Promise<boolean> {
    try {
      const attachments = existsSync(LOGO_PATH)
        ? [{ filename: 'neurooption-logo.png', path: LOGO_PATH, cid: LOGO_CID, contentDisposition: 'inline' as const }]
        : [];
      const info = await this.transporter.sendMail({ from: this.from, to, ...content, attachments });
      if (!this.enabled) {
        this.logger.warn(`[mail disabled] "${content.subject}" -> ${to}`);
        return false;
      }
      const rejected = (info.rejected || []).map(String);
      if (rejected.length) {
        this.logger.error(`SMTP rejected recipient(s) ${rejected.join(', ')} for "${content.subject}": ${info.response}`);
        return false;
      }
      this.logger.log(`Sent "${content.subject}" to ${to} (messageId=${info.messageId})`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send "${content.subject}" to ${to}: ${err.message}`);
      return false;
    }
  }

  sendWelcome(to: string, name: string) {
    return this.send(to, welcomeEmail(name, this.appUrl));
  }

  sendPasswordResetCode(to: string, name: string, code: string, ttlMinutes: number) {
    return this.send(to, passwordResetCodeEmail(name, code, ttlMinutes));
  }

  sendPasswordChanged(to: string, name: string) {
    return this.send(to, passwordChangedEmail(name, this.appUrl));
  }

  sendAccountDeleted(to: string, name: string) {
    return this.send(to, accountDeletedEmail(name));
  }
}
