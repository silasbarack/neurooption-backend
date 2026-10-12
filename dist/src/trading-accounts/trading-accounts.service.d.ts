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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
            type: import(".prisma/client").$Enums.AccountType;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
    private includeRelations;
}
