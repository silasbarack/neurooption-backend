import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
export declare class TradesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTradeDto): Promise<{
        payouts: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: Prisma.Decimal;
            userId: string;
            walletId: string;
            currency: string;
            transactionId: string;
            gatewayId: string | null;
            tradeId: string | null;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            symbol: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            category: import(".prisma/client").$Enums.AssetCategory;
            marketType: import(".prisma/client").$Enums.MarketType;
        };
        expiry: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            duration: string;
            seconds: number;
            label: string;
        };
    } & {
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
    }>;
    findAll(query: TradeQueryDto): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
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
    }>;
    findByUser(userId: string, skip?: number, take?: number): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
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
    })[]>;
    settle(id: string, dto: SettleTradeDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
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
    }>;
    cancel(id: string, reason?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: Prisma.Decimal;
            pair: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
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
    }>;
    private calculateResult;
    private calculateProfit;
    private includeRelations;
    private includeRelationsMinimal;
}
