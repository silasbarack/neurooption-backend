import { CreateCopyTradeDto } from './dto/create-copy-trade.dto';
import { CreateSocialFollowDto } from './dto/create-social-follow.dto';
import { UpdateCopyTradeDto } from './dto/update-copy-trade.dto';
import { UpdateSocialFollowDto } from './dto/update-social-follow.dto';
import { SocialTradingService } from './social-trading.service';
export declare class SocialTradingController {
    private readonly service;
    constructor(service: SocialTradingService);
    followTrader(dto: CreateSocialFollowDto): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    findAllFollows(): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    })[]>;
    findFollowersOfTrader(traderUserId: string): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    })[]>;
    findTradersFollowedByUser(followerUserId: string): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    })[]>;
    findFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    updateFollow(id: string, dto: UpdateSocialFollowDto): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    pauseFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    resumeFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    stopFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    createCopyTrade(dto: CreateCopyTradeDto): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        copies: {
            id: string;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        followerUserId: string;
        traderUserId: string;
    }>;
    findCopyTrades(): Promise<({
        socialFollow: {
            id: string;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            followerUserId: string;
            traderUserId: string;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        masterTrade: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        closedAt: Date | null;
    })[]>;
    findCopyTradesByFollower(followerUserId: string): Promise<({
        socialFollow: {
            id: string;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            followerUserId: string;
            traderUserId: string;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        masterTrade: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        closedAt: Date | null;
    })[]>;
    findCopyTradesByMaster(masterUserId: string): Promise<({
        socialFollow: {
            id: string;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            followerUserId: string;
            traderUserId: string;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        masterTrade: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        closedAt: Date | null;
    })[]>;
    updateCopyTrade(id: string, dto: UpdateCopyTradeDto): Promise<{
        socialFollow: {
            id: string;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            followerUserId: string;
            traderUserId: string;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        masterTrade: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            openedAt: Date;
            closedAt: Date | null;
            userId: string;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
        openedAt: Date;
        closedAt: Date | null;
    }>;
}
