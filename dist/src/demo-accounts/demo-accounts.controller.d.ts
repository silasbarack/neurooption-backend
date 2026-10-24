import { AccountCurrency } from '@prisma/client';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { DemoAccountsService } from './demo-accounts.service';
export declare class DemoAccountsController {
    private readonly service;
    constructor(service: DemoAccountsService);
    private assertSelf;
    create(req: AuthenticatedRequest, userId: string, currency?: AccountCurrency): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    findByUser(req: AuthenticatedRequest, userId: string): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    switchCurrency(req: AuthenticatedRequest, userId: string, dto: SwitchAccountCurrencyDto): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    reset(req: AuthenticatedRequest, accountId: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
}
