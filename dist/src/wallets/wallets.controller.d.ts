import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getWallets(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        accountType: string;
        balanceUsd: import("@prisma/client/runtime/library").Decimal;
        lockedUsd: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    deposit(dto: DepositDto): Promise<{
        message: string;
        wallet: {
            id: any;
            userId: any;
            accountType: any;
            currency: any;
            balance: number;
            balanceUsd: number;
            locked: number;
            lockedUsd: number;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    withdraw(dto: WithdrawDto): Promise<{
        message: string;
        wallet: {
            id: any;
            userId: any;
            accountType: any;
            currency: any;
            balance: number;
            balanceUsd: number;
            locked: number;
            lockedUsd: number;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    markWithdrawalProcessing(transactionId: string): Promise<{
        id: string;
        status: string;
    }>;
    completeWithdrawal(transactionId: string): Promise<{
        id: string;
        status: string;
    }>;
    rejectWithdrawal(transactionId: string, dto: RejectWithdrawalDto): Promise<{
        id: string;
        status: string;
        reason: any;
    }>;
}
