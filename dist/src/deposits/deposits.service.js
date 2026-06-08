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
exports.DepositsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let DepositsService = class DepositsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: dto.walletId },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (wallet.userId !== dto.userId) {
            throw new common_1.BadRequestException('Wallet does not belong to user');
        }
        const gateway = await this.prisma.paymentGateway.findUnique({
            where: {
                type_direction: {
                    type: dto.gatewayType,
                    direction: client_1.PaymentDirection.IN,
                },
            },
        });
        if (!gateway)
            throw new common_1.NotFoundException('Deposit gateway not found');
        if (!gateway.isActive) {
            throw new common_1.BadRequestException('Payment gateway is inactive');
        }
        const amount = new client_1.Prisma.Decimal(dto.amount);
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    userId: dto.userId,
                    walletId: dto.walletId,
                    type: client_1.TransactionType.DEPOSIT,
                    status: client_1.TransactionStatus.PENDING,
                    amount,
                    reference: `DEP_${Date.now()}`,
                    description: `Deposit via ${gateway.type}`,
                },
            });
            return tx.deposit.create({
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
        return this.prisma.deposit.findMany({
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByUser(userId) {
        return this.prisma.deposit.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const deposit = await this.prisma.deposit.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!deposit)
            throw new common_1.NotFoundException('Deposit not found');
        return deposit;
    }
    async updateStatus(id, dto) {
        const deposit = await this.prisma.deposit.findUnique({
            where: { id },
            include: {
                transaction: true,
                wallet: true,
            },
        });
        if (!deposit)
            throw new common_1.NotFoundException('Deposit not found');
        if (deposit.status === client_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Deposit already completed');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.deposit.update({
                where: { id },
                data: {
                    status: dto.status,
                    externalRef: dto.externalRef,
                },
                include: this.includeRelations(),
            });
            await tx.transaction.update({
                where: { id: deposit.transactionId },
                data: {
                    status: dto.status,
                    reference: dto.externalRef ?? deposit.transaction.reference,
                },
            });
            if (dto.status === client_1.TransactionStatus.COMPLETED) {
                await tx.wallet.update({
                    where: { id: deposit.walletId },
                    data: {
                        balance: {
                            increment: deposit.amount,
                        },
                    },
                });
            }
            return updated;
        });
    }
    async markCompleted(id, externalRef) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.COMPLETED,
            externalRef,
        });
    }
    async markFailed(id, externalRef) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.FAILED,
            externalRef,
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
exports.DepositsService = DepositsService;
exports.DepositsService = DepositsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepositsService);
//# sourceMappingURL=deposits.service.js.map