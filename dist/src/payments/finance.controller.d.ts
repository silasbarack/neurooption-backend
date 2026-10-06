import type { AuthenticatedRequest } from './authenticated-request';
import { WithdrawalRequestDto } from './dto/withdrawal-request.dto';
import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly finance;
    constructor(finance: FinanceService);
    overview(req: AuthenticatedRequest): Promise<{
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
    requestWithdrawal(req: AuthenticatedRequest, dto: WithdrawalRequestDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: number;
        currency: string;
        message: string;
    }>;
}
