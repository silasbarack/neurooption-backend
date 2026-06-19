import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
    create(dto: CreateTradeDto): Promise<{
        payouts: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
}
