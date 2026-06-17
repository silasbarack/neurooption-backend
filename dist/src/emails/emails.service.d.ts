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
export declare class EmailsService {
    sendRegistrationEmail(arg0: {
        email: string;
        fullName: string;
    }): void;
    sendRegistrationWelcomeEmail(arg0: {
        email: string;
        fullName: any;
    }): void;
    private readonly logger;
    private getTransporterConfig;
    private createTransporter;
    private isConfigured;
    private getFromAddress;
    private formatName;
    private toHtml;
    private sendEmail;
    sendAccountCreatedEmail(email: string, fullName: string): Promise<boolean>;
    sendAccountDeletedEmail(email: string, fullName: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetLink: string, fullName?: string): Promise<boolean>;
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
