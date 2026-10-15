import { AccountType } from '@prisma/client';
import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';
import { TradingAccountsService } from './trading-accounts.service';
export declare class TradingAccountsController {
    private readonly service;
    constructor(service: TradingAccountsService);
    create(dto: CreateTradingAccountDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findByUserAndType(userId: string, type: AccountType): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdateTradingAccountDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    resetDemoAccount(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
    switchCurrency(userId: string, type: AccountType, dto: SwitchAccountCurrencyDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    }>;
}
