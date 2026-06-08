"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialTradingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let SocialTradingService = class SocialTradingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async followTrader(dto) {
        if (dto.followerUserId === dto.traderUserId) {
            throw new common_1.BadRequestException('User cannot follow themselves');
        }
        const follower = await this.prisma.user.findUnique({
            where: { id: dto.followerUserId },
        });
        if (!follower) {
            throw new common_1.NotFoundException('Follower user not found');
        }
        const trader = await this.prisma.user.findUnique({
            where: { id: dto.traderUserId },
        });
        if (!trader) {
            throw new common_1.NotFoundException('Trader user not found');
        }
        const exists = await this.prisma.socialFollow.findUnique({
            where: {
                followerUserId_traderUserId: {
                    followerUserId: dto.followerUserId,
                    traderUserId: dto.traderUserId,
                },
            },
        });
        if (exists) {
            throw new common_1.ConflictException('Follower already follows this trader');
        }
        return this.prisma.socialFollow.create({
            data: {
                followerUserId: dto.followerUserId,
                traderUserId: dto.traderUserId,
                copyPercentage: new client_1.Prisma.Decimal(dto.copyPercentage).div(100),
                maxStakeAmount: dto.maxStakeAmount !== undefined
                    ? new client_1.Prisma.Decimal(dto.maxStakeAmount)
                    : undefined,
                minStakeAmount: dto.minStakeAmount !== undefined
                    ? new client_1.Prisma.Decimal(dto.minStakeAmount)
                    : undefined,
                status: client_1.SocialFollowStatus.ACTIVE,
            },
            include: this.followInclude(),
        });
    }
    async findAllFollows() {
        return this.prisma.socialFollow.findMany({
            include: this.followInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findFollowersOfTrader(traderUserId) {
        return this.prisma.socialFollow.findMany({
            where: {
                traderUserId,
            },
            include: this.followInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findTradersFollowedByUser(followerUserId) {
        return this.prisma.socialFollow.findMany({
            where: {
                followerUserId,
            },
            include: this.followInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findFollow(id) {
        const follow = await this.prisma.socialFollow.findUnique({
            where: { id },
            include: this.followInclude(),
        });
        if (!follow) {
            throw new common_1.NotFoundException('Social follow record not found');
        }
        return follow;
    }
    async updateFollow(id, dto) {
        await this.findFollow(id);
        return this.prisma.socialFollow.update({
            where: { id },
            data: {
                status: dto.status,
                copyPercentage: dto.copyPercentage !== undefined
                    ? new client_1.Prisma.Decimal(dto.copyPercentage).div(100)
                    : undefined,
                maxStakeAmount: dto.maxStakeAmount !== undefined
                    ? new client_1.Prisma.Decimal(dto.maxStakeAmount)
                    : undefined,
                minStakeAmount: dto.minStakeAmount !== undefined
                    ? new client_1.Prisma.Decimal(dto.minStakeAmount)
                    : undefined,
            },
            include: this.followInclude(),
        });
    }
    async pauseFollow(id) {
        return this.updateFollow(id, {
            status: client_1.SocialFollowStatus.PAUSED,
        });
    }
    async resumeFollow(id) {
        return this.updateFollow(id, {
            status: client_1.SocialFollowStatus.ACTIVE,
        });
    }
    async stopFollow(id) {
        return this.updateFollow(id, {
            status: client_1.SocialFollowStatus.STOPPED,
        });
    }
    async createCopyTrade(dto) {
        const follow = await this.prisma.socialFollow.findUnique({
            where: { id: dto.socialFollowId },
        });
        if (!follow) {
            throw new common_1.NotFoundException('Social follow record not found');
        }
        if (follow.status !== client_1.SocialFollowStatus.ACTIVE) {
            throw new common_1.BadRequestException('Social follow is not active');
        }
        const masterTrade = await this.prisma.trade.findUnique({
            where: { id: dto.masterTradeId },
        });
        if (!masterTrade) {
            throw new common_1.NotFoundException('Master trade not found');
        }
        return this.prisma.socialFollow.update({
            where: { id: dto.socialFollowId },
            data: {
                copiedTrades: {
                    increment: 1,
                },
                copies: {
                    create: {
                        masterUserId: dto.masterUserId,
                        followerUserId: dto.followerUserId,
                        masterTradeId: dto.masterTradeId,
                        followerTradeId: dto.followerTradeId,
                        stakeAmount: new client_1.Prisma.Decimal(dto.stakeAmount),
                        payoutRate: new client_1.Prisma.Decimal(dto.payoutRate),
                        entryPrice: new client_1.Prisma.Decimal(dto.entryPrice),
                        status: client_1.CopyTradeStatus.OPEN,
                    },
                },
            },
            include: this.followInclude(),
        });
    }
    async findCopyTrades() {
        return this.prisma.copyTrade.findMany({
            include: this.copyTradeInclude(),
            orderBy: {
                openedAt: 'desc',
            },
        });
    }
    async findCopyTradesByFollower(followerUserId) {
        return this.prisma.copyTrade.findMany({
            where: { followerUserId },
            include: this.copyTradeInclude(),
            orderBy: {
                openedAt: 'desc',
            },
        });
    }
    async findCopyTradesByMaster(masterUserId) {
        return this.prisma.copyTrade.findMany({
            where: { masterUserId },
            include: this.copyTradeInclude(),
            orderBy: {
                openedAt: 'desc',
            },
        });
    }
    async updateCopyTrade(id, dto) {
        const copyTrade = await this.prisma.copyTrade.findUnique({
            where: { id },
        });
        if (!copyTrade) {
            throw new common_1.NotFoundException('Copy trade not found');
        }
        return this.prisma.copyTrade.update({
            where: { id },
            data: {
                status: dto.status,
                exitPrice: dto.exitPrice !== undefined
                    ? new client_1.Prisma.Decimal(dto.exitPrice)
                    : undefined,
                profitAmount: dto.profitAmount !== undefined
                    ? new client_1.Prisma.Decimal(dto.profitAmount)
                    : undefined,
                closedAt: dto.status &&
                    dto.status !== client_1.CopyTradeStatus.OPEN
                    ? new Date()
                    : undefined,
            },
            include: this.copyTradeInclude(),
        });
    }
    followInclude() {
        return {
            follower: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            trader: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            copies: true,
        };
    }
    copyTradeInclude() {
        return {
            socialFollow: true,
            masterUser: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            followerUser: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            masterTrade: true,
        };
    }
};
exports.SocialTradingService = SocialTradingService;
exports.SocialTradingService = SocialTradingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SocialTradingService);
//# sourceMappingURL=social-trading.service.js.map