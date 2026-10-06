import { OnModuleInit } from '@nestjs/common';
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
export declare class EmailsService implements OnModuleInit {
    private readonly logger;
    private transporter;
    onModuleInit(): void;
    private env;
    private errorMessage;
    private getProvider;
    private getTransporterConfig;
    private getTransporter;
    private getFromAddress;
    private parseFromAddress;
    private getFrontendUrl;
    private getHostedLogoUrl;
    private escapeHtml;
    private formatName;
    private brandedHtml;
    private toHtml;
    private postJson;
    private deliver;
    private sendEmail;
    sendAccountCreatedEmail(email: string, fullName: string): Promise<boolean>;
    sendAccountDeletedEmail(email: string, fullName: string): Promise<boolean>;
    sendPasswordRecoveryCodeEmail(email: string, code: string, fullName?: string): Promise<boolean>;
    sendPasswordChangedEmail(email: string, fullName: string): Promise<boolean>;
    depositSuccessful(data: MoneyEmailData): EmailTemplate;
    withdrawalRequested(data: MoneyEmailData): EmailTemplate;
    withdrawalProcessing(data: MoneyEmailData): EmailTemplate;
    withdrawalCompleted(data: MoneyEmailData): EmailTemplate;
    withdrawalDeclined(data: MoneyEmailData & {
        reason: string;
    }): EmailTemplate;
    kycSubmitted(fullName: string): EmailTemplate;
    kycApproved(fullName: string): EmailTemplate;
    kycRejected(fullName: string, reason: string): EmailTemplate;
    sendTemplateEmail(email: string, template: EmailTemplate): Promise<boolean>;
    sendDepositSuccessfulEmail(email: string, data: MoneyEmailData): Promise<boolean>;
    sendWithdrawalRequestedEmail(email: string, data: MoneyEmailData): Promise<boolean>;
    sendWithdrawalProcessingEmail(email: string, data: MoneyEmailData): Promise<boolean>;
    sendWithdrawalCompletedEmail(email: string, data: MoneyEmailData): Promise<boolean>;
    sendWithdrawalDeclinedEmail(email: string, data: MoneyEmailData & {
        reason: string;
    }): Promise<boolean>;
    sendKycSubmittedEmail(email: string, fullName: string): Promise<boolean>;
    sendKycApprovedEmail(email: string, fullName: string): Promise<boolean>;
    sendKycRejectedEmail(email: string, fullName: string, reason: string): Promise<boolean>;
}
export {};
