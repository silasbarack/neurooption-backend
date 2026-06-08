import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
export declare class TradesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTradeDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            symbol: string;
            id: string;
            payoutRate: Prisma.Decimal;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            marketType: import(".prisma/client").$Enums.MarketType;
            isActive: boolean;
        };
        expiry: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            duration: string;
            seconds: number;
            label: string;
        } | null;
        payouts: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            walletId: string;
            gatewayId: string | null;
            transactionId: string;
            tradeId: string | null;
            amount: Prisma.Decimal;
        }[];
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
    findAll(query: TradeQueryDto): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: Prisma.Decimal;
            isActive: boolean;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        } | null;
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: Prisma.Decimal;
            isActive: boolean;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        } | null;
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
    findByUser(userId: string, skip?: number, take?: number): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: Prisma.Decimal;
            isActive: boolean;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        } | null;
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    })[]>;
    settle(id: string, dto: SettleTradeDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: Prisma.Decimal;
            isActive: boolean;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        } | null;
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
    cancel(id: string, reason?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: Prisma.Decimal;
            isActive: boolean;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        } | null;
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
    private calculateResult;
    private calculateProfit;
    private includeRelations;
    private includeRelationsMinimal;
}
