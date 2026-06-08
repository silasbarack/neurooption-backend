type MoneyEmailData = {
    amount: number;
    currency: string;
    method: string;
    transactionId: string;
    dateTime: string;
};
export declare class EmailsService {
    private readonly logger;
    private getTransporterConfig;
    private createTransporter;
    private isConfigured;
    private sendEmail;
    sendAccountCreatedEmail(email: string, fullName: string): Promise<boolean>;
    sendAccountDeletedEmail(email: string, fullName: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean>;
    depositSuccessful(data: MoneyEmailData): {
        subject: string;
        body: string;
    };
    withdrawalRequested(data: MoneyEmailData): {
        subject: string;
        body: string;
    };
    withdrawalProcessing(data: MoneyEmailData): {
        subject: string;
        body: string;
    };
    withdrawalCompleted(data: MoneyEmailData): {
        subject: string;
        body: string;
    };
    withdrawalDeclined(data: MoneyEmailData & {
        reason: string;
    }): {
        subject: string;
        body: string;
    };
    kycSubmitted(fullName: string): {
        subject: string;
        body: string;
    };
    kycApproved(fullName: string): {
        subject: string;
        body: string;
    };
    kycRejected(fullName: string, reason: string): {
        subject: string;
        body: string;
    };
}
export {};
