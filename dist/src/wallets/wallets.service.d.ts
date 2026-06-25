import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { AccountCurrency, AccountType } from '../trading-engine/trading-engine.types';
export declare class WalletsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWallet(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        accountType: string;
        balanceUsd: Prisma.Decimal;
        lockedUsd: Prisma.Decimal;
    }[]>;
    getUserWallets(userIdOrQuery?: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        accountType: string;
        balanceUsd: Prisma.Decimal;
        lockedUsd: Prisma.Decimal;
    }[]>;
    getBalance(userId: string, accountType?: AccountType, currency?: AccountCurrency): Promise<{
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
    }>;
    debit(userId: string, accountType: AccountType, amountUsd: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        accountType: string;
        balanceUsd: Prisma.Decimal;
        lockedUsd: Prisma.Decimal;
    }>;
    credit(userId: string, accountType: AccountType, amountUsd: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        accountType: string;
        balanceUsd: Prisma.Decimal;
        lockedUsd: Prisma.Decimal;
    }>;
    deposit(dto: any): Promise<{
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
    withdraw(dto: any): Promise<{
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
    markWithdrawalProcessing(id: string): Promise<{
        id: string;
        status: string;
    }>;
    completeWithdrawal(id: string): Promise<{
        id: string;
        status: string;
    }>;
    rejectWithdrawal(id: string, dto?: any): Promise<{
        id: string;
        status: string;
        reason: any;
    }>;
    ensureWallet(userId: string, accountType?: AccountType, currency?: AccountCurrency): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        accountType: string;
        balanceUsd: Prisma.Decimal;
        lockedUsd: Prisma.Decimal;
    }>;
    private formatWallet;
}
