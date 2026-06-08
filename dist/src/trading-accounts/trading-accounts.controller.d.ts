import { AccountType } from '@prisma/client';
import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';
import { TradingAccountsService } from './trading-accounts.service';
export declare class TradingAccountsController {
    private readonly service;
    constructor(service: TradingAccountsService);
    create(dto: CreateTradingAccountDto): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    }>;
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.AccountType;
            userId: string;
        };
        real: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.AccountType;
            userId: string;
        };
    }>;
    findAll(): Promise<({
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    })[]>;
    findByUser(userId: string): Promise<({
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    })[]>;
    findByUserAndType(userId: string, type: AccountType): Promise<({
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    }>;
    update(id: string, dto: UpdateTradingAccountDto): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    }>;
    resetDemoAccount(id: string): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    }>;
    switchCurrency(userId: string, type: AccountType, dto: SwitchAccountCurrencyDto): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
        userId: string;
    }>;
}
