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
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    createDefaultAccounts(userId: string): Promise<{
        demo: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            type: import(".prisma/client").$Enums.AccountType;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
        };
        real: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            type: import(".prisma/client").$Enums.AccountType;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            balance: Prisma.Decimal;
            locked: Prisma.Decimal;
        };
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    })[]>;
    findByUserAndType(userId: string, type: AccountType): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    switchCurrency(userId: string, type: AccountType, dto: SwitchAccountCurrencyDto): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    resetDemoAccount(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    update(id: string, dto: UpdateTradingAccountDto): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        type: import(".prisma/client").$Enums.AccountType;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: Prisma.Decimal;
        locked: Prisma.Decimal;
    }>;
    private includeRelations;
}
