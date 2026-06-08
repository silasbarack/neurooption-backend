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
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let PayoutsService = class PayoutsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.minPayoutRate = new client_1.Prisma.Decimal(0.20);
        this.maxPayoutRate = new client_1.Prisma.Decimal(0.92);
    }
    async calculateExpectedPayout(dto) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: dto.assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        if (!asset.isActive) {
            throw new common_1.BadRequestException('Asset is not active');
        }
        const payoutRate = this.validatePayoutRate(asset.payoutRate);
        const stakeAmount = new client_1.Prisma.Decimal(dto.stakeAmount);
        const expectedProfit = stakeAmount.mul(payoutRate);
        const expectedReturn = stakeAmount.plus(expectedProfit);
        return {
            assetId: asset.id,
            symbol: asset.symbol,
            marketType: asset.marketType,
            stakeAmount: Number(stakeAmount.toFixed(2)),
            payoutPercentage: Number(payoutRate.mul(100).toFixed(2)),
            expectedProfit: Number(expectedProfit.toFixed(2)),
            expectedReturn: Number(expectedReturn.toFixed(2)),
            message: 'Expected profit applies only if the trade wins',
        };
    }
    async updateAssetPayout(dto) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: dto.assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        const payoutRate = new client_1.Prisma.Decimal(dto.payoutPercentage).div(100);
        this.validatePayoutRate(payoutRate);
        return this.prisma.asset.update({
            where: { id: dto.assetId },
            data: {
                payoutRate,
            },
        });
    }
    async create(dto) {
        const amount = new client_1.Prisma.Decimal(dto.amount);
        return this.prisma.payout.create({
            data: {
                userId: dto.userId,
                walletId: dto.walletId,
                gatewayId: dto.gatewayId,
                transactionId: dto.transactionId,
                tradeId: dto.tradeId,
                amount,
                currency: dto.currency ?? 'KES',
                status: dto.status ?? client_1.TransactionStatus.PENDING,
            },
            include: this.includeRelations(),
        });
    }
    async createTradeWinPayout(params) {
        const payoutRate = this.validatePayoutRate(params.payoutRate);
        const profit = params.stakeAmount.mul(payoutRate);
        const totalPayout = params.stakeAmount.plus(profit);
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId: params.userId,
                    walletId: params.walletId,
                    type: client_1.TransactionType.TRADE_PROFIT,
                    status: client_1.TransactionStatus.COMPLETED,
                    amount: totalPayout,
                    reference: `PAYOUT_${params.tradeId}`,
                    description: `Trade payout. Stake plus profit for trade ${params.tradeId}`,
                },
            });
            await tx.wallet.update({
                where: { id: params.walletId },
                data: {
                    balance: {
                        increment: totalPayout,
                    },
                },
            });
            return tx.payout.create({
                data: {
                    userId: params.userId,
                    walletId: params.walletId,
                    transactionId: transaction.id,
                    tradeId: params.tradeId,
                    amount: totalPayout,
                    currency: params.currency ?? 'KES',
                    status: client_1.TransactionStatus.COMPLETED,
                },
                include: this.includeRelations(),
            });
        });
    }
    async findAll() {
        return this.prisma.payout.findMany({
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.payout.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByTrade(tradeId) {
        return this.prisma.payout.findMany({
            where: { tradeId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const payout = await this.prisma.payout.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!payout) {
            throw new common_1.NotFoundException('Payout not found');
        }
        return payout;
    }
    validatePayoutRate(rate) {
        if (rate.lessThan(this.minPayoutRate)) {
            throw new common_1.BadRequestException('Minimum payout is 20%');
        }
        if (rate.greaterThan(this.maxPayoutRate)) {
            throw new common_1.BadRequestException('Maximum payout is 92%');
        }
        return rate;
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
            wallet: true,
            gateway: true,
            transaction: true,
            trade: true,
        };
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map