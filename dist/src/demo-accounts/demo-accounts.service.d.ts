import { AccountCurrency } from '@prisma/client';
import { TradingAccountsService } from '../trading-accounts/trading-accounts.service';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
export declare class DemoAccountsService {
    private readonly tradingAccountsService;
    constructor(tradingAccountsService: TradingAccountsService);
    create(userId: string, currency?: AccountCurrency): Promise<{
        trades: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
    }>;
    findByUser(userId: string): Promise<({
        trades: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
    })[]>;
    switchCurrency(userId: string, dto: SwitchAccountCurrencyDto): Promise<{
        trades: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
    }>;
    reset(accountId: string): Promise<{
        trades: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
    }>;
}
