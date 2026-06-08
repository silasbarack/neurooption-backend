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
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let WithdrawalsService = class WithdrawalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: dto.walletId },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (wallet.userId !== dto.userId) {
            throw new common_1.BadRequestException('Wallet does not belong to user');
        }
        const amount = new client_1.Prisma.Decimal(dto.amount);
        if (wallet.balance.lessThan(amount)) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const gateway = await this.prisma.paymentGateway.findUnique({
            where: {
                type_direction: {
                    type: dto.gatewayType,
                    direction: client_1.PaymentDirection.OUT,
                },
            },
        });
        if (!gateway)
            throw new common_1.NotFoundException('Withdrawal gateway not found');
        if (!gateway.isActive) {
            throw new common_1.BadRequestException('Payment gateway is inactive');
        }
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId: dto.userId,
                    walletId: dto.walletId,
                    type: client_1.TransactionType.WITHDRAWAL,
                    status: client_1.TransactionStatus.PENDING,
                    amount,
                    reference: `WDR_${Date.now()}`,
                    description: `Withdrawal via ${gateway.type}`,
                },
            });
            await tx.wallet.update({
                where: { id: dto.walletId },
                data: {
                    balance: {
                        decrement: amount,
                    },
                    locked: {
                        increment: amount,
                    },
                },
            });
            return tx.withdrawal.create({
                data: {
                    userId: dto.userId,
                    walletId: dto.walletId,
                    gatewayId: gateway.id,
                    transactionId: transaction.id,
                    amount,
                    currency: dto.currency ?? wallet.currency,
                    phone: dto.phone,
                    status: client_1.TransactionStatus.PENDING,
                },
                include: this.includeRelations(),
            });
        });
    }
    async findAll() {
        return this.prisma.withdrawal.findMany({
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByUser(userId) {
        return this.prisma.withdrawal.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const withdrawal = await this.prisma.withdrawal.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!withdrawal)
            throw new common_1.NotFoundException('Withdrawal not found');
        return withdrawal;
    }
    async updateStatus(id, dto) {
        const withdrawal = await this.prisma.withdrawal.findUnique({
            where: { id },
            include: {
                transaction: true,
                wallet: true,
            },
        });
        if (!withdrawal)
            throw new common_1.NotFoundException('Withdrawal not found');
        if (withdrawal.status === client_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Withdrawal already completed');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.withdrawal.update({
                where: { id },
                data: {
                    status: dto.status,
                    externalRef: dto.externalRef,
                    rejectionReason: dto.rejectionReason,
                },
                include: this.includeRelations(),
            });
            await tx.transaction.update({
                where: { id: withdrawal.transactionId },
                data: {
                    status: dto.status,
                    reference: dto.externalRef ?? withdrawal.transaction.reference,
                    description: dto.rejectionReason ?? withdrawal.transaction.description,
                },
            });
            if (dto.status === client_1.TransactionStatus.COMPLETED) {
                await tx.wallet.update({
                    where: { id: withdrawal.walletId },
                    data: {
                        locked: {
                            decrement: withdrawal.amount,
                        },
                    },
                });
            }
            if (dto.status === client_1.TransactionStatus.REJECTED ||
                dto.status === client_1.TransactionStatus.FAILED ||
                dto.status === client_1.TransactionStatus.CANCELLED) {
                await tx.wallet.update({
                    where: { id: withdrawal.walletId },
                    data: {
                        locked: {
                            decrement: withdrawal.amount,
                        },
                        balance: {
                            increment: withdrawal.amount,
                        },
                    },
                });
            }
            return updated;
        });
    }
    async approve(id, externalRef) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.COMPLETED,
            externalRef,
        });
    }
    async reject(id, rejectionReason) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.REJECTED,
            rejectionReason,
        });
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
        };
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map