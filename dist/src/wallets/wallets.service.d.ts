import { AccountCurrency, AccountType } from '../trading-engine/trading-engine.types';
type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
type WithdrawalRecord = {
    id: string;
    userId: string;
    accountType: AccountType;
    currency: AccountCurrency;
    amount: number;
    amountUsd: number;
    status: WithdrawalStatus;
    reason?: string;
    createdAt: string;
    updatedAt: string;
};
export declare class WalletsService {
    private readonly wallets;
    private readonly withdrawals;
    getWallet(userId: string): {
        userId: string;
        balancesUsd: {
            "QT Demo": number;
            "QT Real": number;
        };
        updatedAt: string;
    };
    getUserWallets(userIdOrQuery?: any, accountType?: AccountType, currency?: AccountCurrency): {
        userId: string;
        accountType: AccountType;
        currency: AccountCurrency;
        balanceUsd: number;
        balance: number;
        updatedAt: string;
    }[];
    getBalance(userId: string, accountType?: AccountType, currency?: AccountCurrency): {
        userId: string;
        accountType: AccountType;
        currency: AccountCurrency;
        balanceUsd: number;
        balance: number;
        updatedAt: string;
    };
    debit(userId: string, accountType: AccountType, amountUsd: number): {
        userId: string;
        balancesUsd: {
            "QT Demo": number;
            "QT Real": number;
        };
        updatedAt: string;
    };
    credit(userId: string, accountType: AccountType, amountUsd: number): {
        userId: string;
        balancesUsd: {
            "QT Demo": number;
            "QT Real": number;
        };
        updatedAt: string;
    };
    deposit(dto: any): {
        message: string;
        wallet: {
            userId: string;
            accountType: AccountType;
            currency: AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    withdraw(dto: any): {
        message: string;
        withdrawal: WithdrawalRecord;
        wallet: {
            userId: string;
            accountType: AccountType;
            currency: AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    markWithdrawalProcessing(id: string, dto?: any): WithdrawalRecord;
    completeWithdrawal(id: string, dto?: any): WithdrawalRecord;
    rejectWithdrawal(id: string, reasonOrDto?: any): WithdrawalRecord;
    cancelWithdrawal(id: string, reasonOrDto?: any): WithdrawalRecord;
    findWithdrawal(id: string): WithdrawalRecord;
    findWithdrawals(userId?: string): WithdrawalRecord[];
    private patchWithdrawal;
    private ensureWallet;
    private extractReason;
    private createId;
}
export {};
