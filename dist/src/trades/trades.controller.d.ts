import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
    create(dto: CreateTradeDto): Promise<{
        asset: {
            symbol: string;
            id: string;
            name: string;
            category: import(".prisma/client").$Enums.AssetCategory;
            marketType: import(".prisma/client").$Enums.MarketType;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            seconds: number;
            duration: string;
            label: string;
        };
        payouts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            currency: string;
            userId: string;
            transactionId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            walletId: string;
            gatewayId: string | null;
            tradeId: string | null;
        }[];
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    }>;
    findAll(query: TradeQueryDto): Promise<({
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            pair: never;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    })[]>;
    findByUser(userId: string): Promise<({
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            pair: never;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    })[]>;
    findOne(id: string): Promise<{
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            pair: never;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    }>;
    settle(id: string, dto: SettleTradeDto): Promise<{
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            pair: never;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    }>;
    cancel(id: string, reason?: string): Promise<{
        asset: {
            id: string;
            isActive: boolean;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            pair: never;
        };
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        expiry: {
            id: string;
            isActive: boolean;
            duration: string;
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.TradeStatus;
        userId: string;
        expiresAt: Date;
        openedAt: Date;
        closedAt: Date | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        tradingAccountId: string | null;
        assetId: string;
        expiryId: string | null;
        direction: import(".prisma/client").$Enums.TradeDirection;
    }>;
}
