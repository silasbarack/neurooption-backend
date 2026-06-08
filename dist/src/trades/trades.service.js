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
exports.TradesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let TradesService = class TradesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
            include: {
                wallets: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const wallet = user.wallets.find((item) => item.currency === 'KES');
        if (!wallet) {
            throw new common_1.NotFoundException('KES wallet not found');
        }
        const asset = await this.prisma.asset.findUnique({
            where: { id: dto.assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        if (!asset.isActive) {
            throw new common_1.BadRequestException('Asset is not active');
        }
        if (dto.expiryId) {
            const expiry = await this.prisma.expiry.findUnique({
                where: { id: dto.expiryId },
            });
            if (!expiry) {
                throw new common_1.NotFoundException('Expiry not found');
            }
            if (!expiry.isActive) {
                throw new common_1.BadRequestException('Expiry is not active');
            }
        }
        const stakeAmount = new client_1.Prisma.Decimal(dto.stakeAmount);
        if (wallet.balance.lessThan(stakeAmount)) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const expiresAt = new Date(dto.expiresAt);
        if (expiresAt <= new Date()) {
            throw new common_1.BadRequestException('Expiry time must be in the future');
        }
        return this.prisma.$transaction(async (tx) => {
            const trade = await tx.trade.create({
                data: {
                    userId: dto.userId,
                    assetId: dto.assetId,
                    expiryId: dto.expiryId,
                    direction: dto.direction,
                    status: client_1.TradeStatus.OPEN,
                    stakeAmount,
                    payoutRate: asset.payoutRate,
                    entryPrice: new client_1.Prisma.Decimal(dto.entryPrice),
                    expiresAt,
                },
                include: this.includeRelations(),
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        decrement: stakeAmount,
                    },
                    locked: {
                        increment: stakeAmount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: dto.userId,
                    walletId: wallet.id,
                    type: client_1.TransactionType.TRADE_STAKE,
                    status: client_1.TransactionStatus.COMPLETED,
                    amount: stakeAmount,
                    reference: `TRADE_STAKE_${trade.id}`,
                    description: `Stake placed for trade ${trade.id}`,
                },
            });
            return trade;
        });
    }
    async findAll(query) {
        const skip = query.skip || 0;
        const take = Math.min(query.take || 50, 100);
        return this.prisma.trade.findMany({
            where: {
                userId: query.userId,
                assetId: query.assetId,
                direction: query.direction,
                status: query.status,
            },
            include: this.includeRelationsMinimal(),
            orderBy: {
                openedAt: 'desc',
            },
            skip,
            take,
        });
    }
    async findOne(id) {
        const trade = await this.prisma.trade.findUnique({
            where: { id },
            include: this.includeRelationsMinimal(),
        });
        if (!trade) {
            throw new common_1.NotFoundException('Trade not found');
        }
        return trade;
    }
    async findByUser(userId, skip, take) {
        const offset = skip || 0;
        const limit = Math.min(take || 50, 100);
        return this.prisma.trade.findMany({
            where: { userId },
            include: this.includeRelationsMinimal(),
            orderBy: {
                openedAt: 'desc',
            },
            skip: offset,
            take: limit,
        });
    }
    async settle(id, dto) {
        const trade = await this.prisma.trade.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        wallets: true,
                    },
                },
                asset: true,
            },
        });
        if (!trade) {
            throw new common_1.NotFoundException('Trade not found');
        }
        if (trade.status !== client_1.TradeStatus.OPEN) {
            throw new common_1.BadRequestException('Trade is already settled');
        }
        const wallet = trade.user.wallets.find((item) => item.currency === 'KES');
        if (!wallet) {
            throw new common_1.NotFoundException('KES wallet not found');
        }
        const exitPrice = new client_1.Prisma.Decimal(dto.exitPrice);
        const resultStatus = this.calculateResult(trade.direction, trade.entryPrice, exitPrice);
        const profitAmount = this.calculateProfit(resultStatus, trade.stakeAmount, trade.payoutRate);
        return this.prisma.$transaction(async (tx) => {
            const updatedTrade = await tx.trade.update({
                where: { id },
                data: {
                    status: resultStatus,
                    exitPrice,
                    profitAmount,
                    closedAt: new Date(),
                },
                include: this.includeRelationsMinimal(),
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    locked: {
                        decrement: trade.stakeAmount,
                    },
                },
            });
            if (resultStatus === client_1.TradeStatus.WON) {
                const totalPayout = trade.stakeAmount.plus(profitAmount);
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: {
                            increment: totalPayout,
                        },
                    },
                });
                const transaction = await tx.transaction.create({
                    data: {
                        userId: trade.userId,
                        walletId: wallet.id,
                        type: client_1.TransactionType.TRADE_PROFIT,
                        status: client_1.TransactionStatus.COMPLETED,
                        amount: totalPayout,
                        reference: `TRADE_PROFIT_${trade.id}`,
                        description: `Trade won. Payout for trade ${trade.id}`,
                    },
                });
                await tx.payout.create({
                    data: {
                        userId: trade.userId,
                        walletId: wallet.id,
                        transactionId: transaction.id,
                        tradeId: trade.id,
                        amount: totalPayout,
                        currency: wallet.currency,
                        status: client_1.TransactionStatus.COMPLETED,
                    },
                });
            }
            if (resultStatus === client_1.TradeStatus.DRAW) {
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: {
                            increment: trade.stakeAmount,
                        },
                    },
                });
                await tx.transaction.create({
                    data: {
                        userId: trade.userId,
                        walletId: wallet.id,
                        type: client_1.TransactionType.REFUND,
                        status: client_1.TransactionStatus.COMPLETED,
                        amount: trade.stakeAmount,
                        reference: `TRADE_REFUND_${trade.id}`,
                        description: `Trade draw. Stake refunded for trade ${trade.id}`,
                    },
                });
            }
            return updatedTrade;
        });
    }
    async cancel(id, reason) {
        const trade = await this.prisma.trade.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        wallets: true,
                    },
                },
            },
        });
        if (!trade) {
            throw new common_1.NotFoundException('Trade not found');
        }
        if (trade.status !== client_1.TradeStatus.OPEN) {
            throw new common_1.BadRequestException('Only open trades can be cancelled');
        }
        const wallet = trade.user.wallets.find((item) => item.currency === 'KES');
        if (!wallet) {
            throw new common_1.NotFoundException('KES wallet not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedTrade = await tx.trade.update({
                where: { id },
                data: {
                    status: client_1.TradeStatus.CANCELLED,
                    closedAt: new Date(),
                },
                include: this.includeRelationsMinimal(),
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    locked: {
                        decrement: trade.stakeAmount,
                    },
                    balance: {
                        increment: trade.stakeAmount,
                    },
                },
            });
            await tx.transaction.create({
                data: {
                    userId: trade.userId,
                    walletId: wallet.id,
                    type: client_1.TransactionType.REFUND,
                    status: client_1.TransactionStatus.COMPLETED,
                    amount: trade.stakeAmount,
                    reference: `TRADE_CANCELLED_${trade.id}`,
                    description: reason ?? `Trade cancelled and stake refunded`,
                },
            });
            return updatedTrade;
        });
    }
    calculateResult(direction, entryPrice, exitPrice) {
        if (exitPrice.equals(entryPrice)) {
            return client_1.TradeStatus.DRAW;
        }
        if (direction === client_1.TradeDirection.BUY &&
            exitPrice.greaterThan(entryPrice)) {
            return client_1.TradeStatus.WON;
        }
        if (direction === client_1.TradeDirection.SELL &&
            exitPrice.lessThan(entryPrice)) {
            return client_1.TradeStatus.WON;
        }
        return client_1.TradeStatus.LOST;
    }
    calculateProfit(status, stakeAmount, payoutRate) {
        if (status !== client_1.TradeStatus.WON) {
            return new client_1.Prisma.Decimal(0);
        }
        return stakeAmount.mul(payoutRate);
    }
    includeRelations() {
        return {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            asset: true,
            expiry: true,
            payouts: true,
        };
    }
    includeRelationsMinimal() {
        return {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            asset: {
                select: {
                    id: true,
                    pair: true,
                    payoutRate: true,
                    isActive: true,
                },
            },
            expiry: {
                select: {
                    id: true,
                    duration: true,
                    isActive: true,
                },
            },
        };
    }
};
exports.TradesService = TradesService;
exports.TradesService = TradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradesService);
//# sourceMappingURL=trades.service.js.map