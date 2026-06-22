import { AccountType, Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';
export declare class TradingAccountsService {
    private readonly prisma;
    private readonly demoStartingBalance;
    constructor(prisma: PrismaService);
    create(dto: CreateTradingAccountDto): Promise<{
        trades: {
            id: string;
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
        };
        real: {
            id: string;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
    }>;
    private includeRelations;
}
