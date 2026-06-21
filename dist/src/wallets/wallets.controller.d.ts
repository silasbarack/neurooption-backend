import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getWallets(userId: string): {
        userId: string;
        accountType: import("../trading-engine/trading-engine.types").AccountType;
        currency: import("../trading-engine/trading-engine.types").AccountCurrency;
        balanceUsd: number;
        balance: number;
        updatedAt: string;
    }[];
    deposit(dto: DepositDto): {
        message: string;
        wallet: {
            userId: string;
            accountType: import("../trading-engine/trading-engine.types").AccountType;
            currency: import("../trading-engine/trading-engine.types").AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    withdraw(dto: WithdrawDto): {
        message: string;
        withdrawal: {
            id: string;
            userId: string;
            accountType: import("../trading-engine/trading-engine.types").AccountType;
            currency: import("../trading-engine/trading-engine.types").AccountCurrency;
            amount: number;
            amountUsd: number;
            status: "PROCESSING" | "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
            reason?: string;
            createdAt: string;
            updatedAt: string;
        };
        wallet: {
            userId: string;
            accountType: import("../trading-engine/trading-engine.types").AccountType;
            currency: import("../trading-engine/trading-engine.types").AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    markWithdrawalProcessing(transactionId: string): {
        id: string;
        userId: string;
        accountType: import("../trading-engine/trading-engine.types").AccountType;
        currency: import("../trading-engine/trading-engine.types").AccountCurrency;
        amount: number;
        amountUsd: number;
        status: "PROCESSING" | "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
        reason?: string;
        createdAt: string;
        updatedAt: string;
    };
    completeWithdrawal(transactionId: string): {
        id: string;
        userId: string;
        accountType: import("../trading-engine/trading-engine.types").AccountType;
        currency: import("../trading-engine/trading-engine.types").AccountCurrency;
        amount: number;
        amountUsd: number;
        status: "PROCESSING" | "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
        reason?: string;
        createdAt: string;
        updatedAt: string;
    };
    rejectWithdrawal(transactionId: string, dto: RejectWithdrawalDto): {
        id: string;
        userId: string;
        accountType: import("../trading-engine/trading-engine.types").AccountType;
        currency: import("../trading-engine/trading-engine.types").AccountCurrency;
        amount: number;
        amountUsd: number;
        status: "PROCESSING" | "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
        reason?: string;
        createdAt: string;
        updatedAt: string;
    };
}
