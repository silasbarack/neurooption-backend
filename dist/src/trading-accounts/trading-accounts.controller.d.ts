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
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
        };
        real: {
            id: string;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
        };
    }>;
    findAll(): Promise<({
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
    findByUserAndType(userId: string, type: AccountType): Promise<({
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
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateTradingAccountDto): Promise<{
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
    resetDemoAccount(id: string): Promise<{
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
    switchCurrency(userId: string, type: AccountType, dto: SwitchAccountCurrencyDto): Promise<{
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
