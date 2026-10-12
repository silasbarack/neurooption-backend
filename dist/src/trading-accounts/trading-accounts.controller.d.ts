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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.AccountType;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
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
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
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
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
}
