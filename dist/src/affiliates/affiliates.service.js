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
exports.AffiliatesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let AffiliatesService = class AffiliatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAffiliate(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingAffiliate = await this.prisma.affiliate.findUnique({
            where: { userId: dto.userId },
        });
        if (existingAffiliate) {
            throw new common_1.ConflictException('User already has an affiliate profile');
        }
        const existingCode = await this.prisma.affiliate.findUnique({
            where: { code: dto.code },
        });
        if (existingCode) {
            throw new common_1.ConflictException('Affiliate code already exists');
        }
        const commissionRate = new client_1.Prisma.Decimal(dto.commissionPercentage ?? 10).div(100);
        return this.prisma.affiliate.create({
            data: {
                userId: dto.userId,
                code: dto.code,
                status: client_1.AffiliateStatus.ACTIVE,
                commissionRate,
            },
            include: this.affiliateInclude(),
        });
    }
    async findAllAffiliates() {
        return this.prisma.affiliate.findMany({
            include: this.affiliateInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findAffiliateById(id) {
        const affiliate = await this.prisma.affiliate.findUnique({
            where: { id },
            include: this.affiliateInclude(),
        });
        if (!affiliate) {
            throw new common_1.NotFoundException('Affiliate not found');
        }
        return affiliate;
    }
    async findAffiliateByUser(userId) {
        const affiliate = await this.prisma.affiliate.findUnique({
            where: { userId },
            include: this.affiliateInclude(),
        });
        if (!affiliate) {
            throw new common_1.NotFoundException('Affiliate not found');
        }
        return affiliate;
    }
    async updateAffiliate(id, dto) {
        await this.findAffiliateById(id);
        const data = {};
        if (dto.status !== undefined) {
            data.status = dto.status;
        }
        if (dto.commissionPercentage !== undefined) {
            data.commissionRate = new client_1.Prisma.Decimal(dto.commissionPercentage).div(100);
        }
        return this.prisma.affiliate.update({
            where: { id },
            data,
            include: this.affiliateInclude(),
        });
    }
    async createCommission(dto) {
        const affiliate = await this.prisma.affiliate.findUnique({
            where: { id: dto.affiliateId },
        });
        if (!affiliate) {
            throw new common_1.NotFoundException('Affiliate not found');
        }
        if (affiliate.status !== client_1.AffiliateStatus.ACTIVE) {
            throw new common_1.BadRequestException('Affiliate is not active');
        }
        const amount = new client_1.Prisma.Decimal(dto.amount);
        const rate = new client_1.Prisma.Decimal(dto.commissionPercentage).div(100);
        const commissionAmount = amount.mul(rate);
        return this.prisma.affiliateCommission.create({
            data: {
                affiliateId: dto.affiliateId,
                affiliateUserId: dto.affiliateUserId,
                referredUserId: dto.referredUserId,
                transactionId: dto.transactionId,
                amount: commissionAmount,
                rate,
                status: client_1.CommissionStatus.PENDING,
                description: dto.description,
            },
            include: this.commissionInclude(),
        });
    }
    async findAllCommissions() {
        return this.prisma.affiliateCommission.findMany({
            include: this.commissionInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findCommissionsByAffiliate(affiliateId) {
        return this.prisma.affiliateCommission.findMany({
            where: { affiliateId },
            include: this.commissionInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateCommissionStatus(id, dto) {
        const commission = await this.prisma.affiliateCommission.findUnique({
            where: { id },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Affiliate commission not found');
        }
        return this.prisma.affiliateCommission.update({
            where: { id },
            data: {
                status: dto.status,
                paidAt: dto.status === client_1.CommissionStatus.PAID ? new Date() : null,
            },
            include: this.commissionInclude(),
        });
    }
    async payCommission(id, walletId) {
        const commission = await this.prisma.affiliateCommission.findUnique({
            where: { id },
            include: {
                affiliateUser: true,
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Affiliate commission not found');
        }
        if (commission.status === client_1.CommissionStatus.PAID) {
            throw new common_1.BadRequestException('Commission already paid');
        }
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId: commission.affiliateUserId,
                    walletId,
                    type: client_1.TransactionType.AFFILIATE_COMMISSION,
                    status: client_1.TransactionStatus.COMPLETED,
                    amount: commission.amount,
                    reference: `AFF_COM_${commission.id}`,
                    description: `Affiliate commission paid`,
                },
            });
            await tx.wallet.update({
                where: { id: walletId },
                data: {
                    balance: {
                        increment: commission.amount,
                    },
                },
            });
            await tx.affiliate.update({
                where: { id: commission.affiliateId },
                data: {
                    totalEarned: {
                        increment: commission.amount,
                    },
                    totalPaid: {
                        increment: commission.amount,
                    },
                },
            });
            return tx.affiliateCommission.update({
                where: { id },
                data: {
                    status: client_1.CommissionStatus.PAID,
                    transactionId: transaction.id,
                    paidAt: new Date(),
                },
                include: this.commissionInclude(),
            });
        });
    }
    affiliateInclude() {
        return {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            commissions: true,
        };
    }
    commissionInclude() {
        return {
            affiliate: true,
            affiliateUser: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            referredUser: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            transaction: true,
        };
    }
};
exports.AffiliatesService = AffiliatesService;
exports.AffiliatesService = AffiliatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AffiliatesService);
//# sourceMappingURL=affiliates.service.js.map