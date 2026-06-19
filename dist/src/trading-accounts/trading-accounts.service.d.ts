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
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    }>;
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AccountType;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
            isActive: boolean;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AccountType;
            userId: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
            isActive: boolean;
        };
    }>;
    findAll(): Promise<({
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    })[]>;
    findByUser(userId: string): Promise<({
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    })[]>;
    findByUserAndType(userId: string, type: AccountType): Promise<({
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    }>;
    switchCurrency(userId: string, type: AccountType, dto: SwitchAccountCurrencyDto): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    }>;
    resetDemoAccount(id: string): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateTradingAccountDto): Promise<{
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            direction: import(".prisma/client").$Enums.TradeDirection;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
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
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
        isActive: boolean;
    }>;
    private includeRelations;
}
