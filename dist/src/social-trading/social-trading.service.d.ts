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
            status: import(".prisma/client").$Enums.CopyTradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            exitPrice: Prisma.Decimal | null;
            followerUserId: string;
            openedAt: Date;
            closedAt: Date | null;
            followerTradeId: string | null;
            masterUserId: string;
            masterTradeId: string;
            socialFollowId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SocialFollowStatus;
        copyPercentage: Prisma.Decimal;
        maxStakeAmount: Prisma.Decimal | null;
        minStakeAmount: Prisma.Decimal | null;
        followerUserId: string;
        traderUserId: string;
        copiedTrades: number;
        totalProfit: Prisma.Decimal;
        totalLoss: Prisma.Decimal;
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
            followerUserId: string;
            traderUserId: string;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        profitAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        followerUserId: string;
        openedAt: Date;
        closedAt: Date | null;
        followerTradeId: string | null;
        masterUserId: string;
        masterTradeId: string;
        socialFollowId: string;
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
            followerUserId: string;
            traderUserId: string;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        profitAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        followerUserId: string;
        openedAt: Date;
        closedAt: Date | null;
        followerTradeId: string | null;
        masterUserId: string;
        masterTradeId: string;
        socialFollowId: string;
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
            followerUserId: string;
            traderUserId: string;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        profitAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        followerUserId: string;
        openedAt: Date;
        closedAt: Date | null;
        followerTradeId: string | null;
        masterUserId: string;
        masterTradeId: string;
        socialFollowId: string;
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
            followerUserId: string;
            traderUserId: string;
            copiedTrades: number;
            totalProfit: Prisma.Decimal;
            totalLoss: Prisma.Decimal;
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
            userId: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            stakeAmount: Prisma.Decimal;
            entryPrice: Prisma.Decimal;
            profitAmount: Prisma.Decimal;
            payoutRate: Prisma.Decimal;
            expiresAt: Date;
            exitPrice: Prisma.Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
            openedAt: Date;
            closedAt: Date | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CopyTradeStatus;
        stakeAmount: Prisma.Decimal;
        entryPrice: Prisma.Decimal;
        profitAmount: Prisma.Decimal;
        payoutRate: Prisma.Decimal;
        exitPrice: Prisma.Decimal | null;
        followerUserId: string;
        openedAt: Date;
        closedAt: Date | null;
        followerTradeId: string | null;
        masterUserId: string;
        masterTradeId: string;
        socialFollowId: string;
    }>;
    private followInclude;
    private copyTradeInclude;
}
