import { AccountCurrency } from '@prisma/client';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { RealAccountsService } from './real-accounts.service';
export declare class RealAccountsController {
    private readonly service;
    constructor(service: RealAccountsService);
    create(userId: string, currency?: AccountCurrency): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            expiresAt: Date;
            closedAt: Date | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    findByUser(userId: string): Promise<({
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            expiresAt: Date;
            closedAt: Date | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    })[]>;
    switchCurrency(userId: string, dto: SwitchAccountCurrencyDto): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            expiresAt: Date;
            closedAt: Date | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
}
