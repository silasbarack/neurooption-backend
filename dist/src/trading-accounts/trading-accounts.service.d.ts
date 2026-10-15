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
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            type: import(".prisma/client").$Enums.AccountType;
            isActive: boolean;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
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
        currency: import(".prisma/client").$Enums.AccountCurrency;
        type: import(".prisma/client").$Enums.AccountType;
        isActive: boolean;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    private includeRelations;
}
