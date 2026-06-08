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
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllFollows(): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findFollowersOfTrader(traderUserId: string): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findTradersFollowedByUser(followerUserId: string): Promise<({
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateFollow(id: string, dto: UpdateSocialFollowDto): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    pauseFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    resumeFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    stopFollow(id: string): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    createCopyTrade(dto: CreateCopyTradeDto): Promise<{
        follower: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        trader: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        copies: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            openedAt: Date;
            closedAt: Date | null;
            socialFollowId: string;
            masterUserId: string;
            followerUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        followerUserId: string;
        traderUserId: string;
        copyPercentage: import("@prisma/client/runtime/library").Decimal;
        maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
        copiedTrades: number;
        totalProfit: import("@prisma/client/runtime/library").Decimal;
        totalLoss: import("@prisma/client/runtime/library").Decimal;
    }>;
    findCopyTrades(): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            followerUserId: string;
            traderUserId: string;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        masterTrade: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
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
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        openedAt: Date;
        closedAt: Date | null;
        socialFollowId: string;
        masterUserId: string;
        followerUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findCopyTradesByFollower(followerUserId: string): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            followerUserId: string;
            traderUserId: string;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        masterTrade: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
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
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        openedAt: Date;
        closedAt: Date | null;
        socialFollowId: string;
        masterUserId: string;
        followerUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findCopyTradesByMaster(masterUserId: string): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            followerUserId: string;
            traderUserId: string;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        masterTrade: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
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
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        openedAt: Date;
        closedAt: Date | null;
        socialFollowId: string;
        masterUserId: string;
        followerUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    updateCopyTrade(id: string, dto: UpdateCopyTradeDto): Promise<{
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            followerUserId: string;
            traderUserId: string;
            copyPercentage: import("@prisma/client/runtime/library").Decimal;
            maxStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            minStakeAmount: import("@prisma/client/runtime/library").Decimal | null;
            copiedTrades: number;
            totalProfit: import("@prisma/client/runtime/library").Decimal;
            totalLoss: import("@prisma/client/runtime/library").Decimal;
        };
        masterUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        followerUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        masterTrade: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            expiresAt: Date;
            userId: string;
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
        };
    } & {
        id: string;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        openedAt: Date;
        closedAt: Date | null;
        socialFollowId: string;
        masterUserId: string;
        followerUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
        stakeAmount: import("@prisma/client/runtime/library").Decimal;
        entryPrice: import("@prisma/client/runtime/library").Decimal;
        exitPrice: import("@prisma/client/runtime/library").Decimal | null;
        profitAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
}
