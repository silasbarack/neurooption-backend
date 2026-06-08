"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailsService = EmailsService_1 = class EmailsService {
    constructor() {
        this.logger = new common_1.Logger(EmailsService_1.name);
    }
    getTransporterConfig() {
        const config = {
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true',
            },
        };
        if (process.env.SMTP_SERVICE) {
            config.service = process.env.SMTP_SERVICE;
        }
        else {
            config.host = process.env.SMTP_HOST || 'smtp.gmail.com';
            config.port = Number(process.env.SMTP_PORT || 587);
            config.secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
        }
        return config;
    }
    createTransporter() {
        return nodemailer.createTransport(this.getTransporterConfig());
    }
    isConfigured() {
        const hasCredentials = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
        const hasServer = !!process.env.SMTP_SERVICE || !!process.env.SMTP_HOST;
        return hasCredentials && hasServer;
    }
    async sendEmail(to, subject, body) {
        try {
            if (!this.isConfigured()) {
                this.logger.warn('SMTP is not configured. Email not sent.');
                return false;
            }
            await this.createTransporter().sendMail({
                from: process.env.SMTP_FROM || `"NeuroOption" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text: body,
                html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5;">${body}</pre>`,
            });
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to send email to ${to}: ${message}`);
            if (error instanceof Error && error.stack) {
                this.logger.error(error.stack);
            }
            return false;
        }
    }
    async sendAccountCreatedEmail(email, fullName) {
        return this.sendEmail(email, 'Welcome to NeuroOption', `
Dear ${fullName},

Your NeuroOption account has been created successfully.

You can now sign in and start using your account.

Thank you for choosing NeuroOption.
      `.trim());
    }
    async sendAccountDeletedEmail(email, fullName) {
        return this.sendEmail(email, 'NeuroOption Account Deleted', `
Dear ${fullName},

Your NeuroOption account has been deleted successfully.

If you did not request this action, please contact Support Service immediately.

Thank you for using NeuroOption.
      `.trim());
    }
    async sendPasswordResetEmail(email, resetLink) {
        try {
            if (!this.isConfigured()) {
                this.logger.warn('SMTP is not configured. Password reset email not sent.');
                return false;
            }
            await this.createTransporter().sendMail({
                from: process.env.SMTP_FROM || `"NeuroOption" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Reset your NeuroOption password',
                text: `Reset your NeuroOption password\n\nOpen the link below to reset your password:\n${resetLink}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`,
                html: `
          <h2>Reset your NeuroOption password</h2>
          <p>Click the button below to reset your password.</p>
          <p>
            <a href="${resetLink}" style="background:#006cff;color:white;padding:12px 18px;text-decoration:none;border-radius:8px;">
              Reset Password
            </a>
          </p>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, ignore this email.</p>
        `,
            });
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Password reset email failed: ${message}`);
            if (error instanceof Error && error.stack) {
                this.logger.error(error.stack);
            }
            return false;
        }
    }
    depositSuccessful(data) {
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

Payment Amount
${data.amount} ${data.currency}

Amount
${data.amount} ${data.currency}

Deposit amount
${data.amount} ${data.currency}
      `.trim(),
        };
    }
    withdrawalRequested(data) {
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
    withdrawalProcessing(data) {
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
    withdrawalCompleted(data) {
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
    withdrawalDeclined(data) {
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
    kycSubmitted(fullName) {
        return {
            subject: 'NeuroOption KYC Documents Received',
            body: `
Dear ${fullName},

Thank you for uploading your KYC documents.

Our compliance team has received your documents and live face verification for careful review. We will notify you once the verification is complete.

Thank you for using NeuroOption.
      `.trim(),
        };
    }
    kycApproved(fullName) {
        return {
            subject: 'NeuroOption KYC Approved',
            body: `
Dear ${fullName},

Your KYC verification has been approved.

You may now continue using NeuroOption services, subject to the platform rules and compliance requirements.

Thank you for using NeuroOption.
      `.trim(),
        };
    }
    kycRejected(fullName, reason) {
        return {
            subject: 'NeuroOption KYC Documents Rejected',
            body: `
Dear ${fullName},

Your KYC documents could not be approved.

Reason:
${reason}

Please upload clear and valid documents, and ensure your live face verification is visible and matches the submitted document.

Thank you for using NeuroOption.
      `.trim(),
        };
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = EmailsService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailsService);
//# sourceMappingURL=emails.service.js.map