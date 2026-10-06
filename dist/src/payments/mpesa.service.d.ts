import { PrismaService } from '../config/prisma.service';
import { DepositsService } from '../deposits/deposits.service';
type CallbackItem = {
    Name: string;
    Value?: string | number;
};
export type StkCallbackBody = {
    Body?: {
        stkCallback?: {
            MerchantRequestID?: string;
            CheckoutRequestID?: string;
            ResultCode?: number | string;
            ResultDesc?: string;
            CallbackMetadata?: {
                Item?: CallbackItem[];
            };
        };
    };
};
export declare class MpesaService {
    private readonly prisma;
    private readonly depositsService;
    private readonly logger;
    private token;
    constructor(prisma: PrismaService, depositsService: DepositsService);
    private env;
    private get environment();
    private get baseUrl();
    private get shortcode();
    private get passkey();
    private get transactionType();
    private get partyB();
    get callbackToken(): string;
    private get callbackUrl();
    isConfigured(): boolean;
    configSummary(): {
        configured: boolean;
        environment: "sandbox" | "production";
        shortcode: string;
        transactionType: string;
        minAmount: number;
        maxAmount: number;
    };
    private get minAmount();
    private fetchJson;
    private getAccessToken;
    private timestamp;
    private password;
    normalizePhone(input: string): string;
    private queryStk;
    private ensureDepositSetup;
    startDeposit(userId: string, phoneInput: string, amountInput: number): Promise<{
        depositId: string;
        status: "PENDING";
        amount: number;
        currency: string;
        phone: string;
        message: string;
    }>;
    getDepositStatus(userId: string, depositId: string): Promise<{
        depositId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: number;
        currency: string;
        phone: string;
        receipt: string;
        message: string;
    }>;
    handleCallback(body: StkCallbackBody): Promise<void>;
    private completeDeposit;
    private failDeposit;
    private toStatus;
}
export {};
