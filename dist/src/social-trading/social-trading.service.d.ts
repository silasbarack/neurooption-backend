import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateCopyTradeDto } from './dto/create-copy-trade.dto';
import { CreateSocialFollowDto } from './dto/create-social-follow.dto';
import { UpdateCopyTradeDto } from './dto/update-copy-trade.dto';
import { UpdateSocialFollowDto } from './dto/update-social-follow.dto';
export declare class SocialTradingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
            followerUserId: string;
            socialFollowId: string;
            masterUserId: string;
            masterTradeId: string;
            followerTradeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
        followerUserId: string;
        traderUserId: string;
    }>;
    findCopyTrades(): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: Prisma.Decimal;
            maxStakeAmount: Prisma.Decimal | null;
            minStakeAmount: Prisma.Decimal | null;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            direction: import(".prisma/client").$Enums.TradeDirection;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        payoutRate: Prisma.Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        closedAt: Date | null;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
    })[]>;
    findCopyTradesByFollower(followerUserId: string): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: Prisma.Decimal;
            maxStakeAmount: Prisma.Decimal | null;
            minStakeAmount: Prisma.Decimal | null;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            direction: import(".prisma/client").$Enums.TradeDirection;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        payoutRate: Prisma.Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        closedAt: Date | null;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
    })[]>;
    findCopyTradesByMaster(masterUserId: string): Promise<({
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: Prisma.Decimal;
            maxStakeAmount: Prisma.Decimal | null;
            minStakeAmount: Prisma.Decimal | null;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            direction: import(".prisma/client").$Enums.TradeDirection;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        payoutRate: Prisma.Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        closedAt: Date | null;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
    })[]>;
    updateCopyTrade(id: string, dto: UpdateCopyTradeDto): Promise<{
        socialFollow: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SocialFollowStatus;
            copyPercentage: Prisma.Decimal;
            maxStakeAmount: Prisma.Decimal | null;
            minStakeAmount: Prisma.Decimal | null;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            payoutRate: Prisma.Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            direction: import(".prisma/client").$Enums.TradeDirection;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            profitAmount: Prisma.Decimal;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        payoutRate: Prisma.Decimal;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        profitAmount: Prisma.Decimal;
        openedAt: Date;
        closedAt: Date | null;
        followerUserId: string;
        socialFollowId: string;
        masterUserId: string;
        masterTradeId: string;
        followerTradeId: string | null;
    }>;
    private followInclude;
    private copyTradeInclude;
}
