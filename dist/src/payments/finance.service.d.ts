import { PrismaService } from '../config/prisma.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';
import { MpesaService } from './mpesa.service';
export declare class FinanceService {
    private readonly prisma;
    private readonly withdrawalsService;
    private readonly mpesa;
    constructor(prisma: PrismaService, withdrawalsService: WithdrawalsService, mpesa: MpesaService);
    overview(userId: string): Promise<{
        wallet: {
            currency: string;
            balance: number;
            locked: number;
        };
        mpesa: {
            configured: boolean;
            environment: "sandbox" | "production";
            shortcode: string;
            transactionType: string;
            minAmount: number;
            maxAmount: number;
        };
        transactions: {
            id: string;
            type: string;
            method: string;
            amount: number;
            currency: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            phone: string;
            reference: string;
            createdAt: Date;
        }[];
    }>;
    requestWithdrawal(userId: string, phone: string, amount: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: number;
        currency: string;
        message: string;
    }>;
}
