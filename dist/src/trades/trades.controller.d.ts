import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        direction: import(".prisma/client").$Enums.TradeDirection;
        status: import(".prisma/client").$Enums.TradeStatus;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
    settle(id: string, dto: SettleTradeDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        asset: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
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
            payoutRate: import("@prisma/client/runtime/library").Decimal;
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
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        expiresAt: Date;
        closedAt: Date | null;
        userId: string;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
    }>;
}
