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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: dto.walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (wallet.userId !== dto.userId) {
            throw new common_1.BadRequestException('Wallet does not belong to this user');
        }
        return this.prisma.transaction.create({
            data: {
                userId: dto.userId,
                walletId: dto.walletId,
                type: dto.type,
                status: dto.status ?? client_1.TransactionStatus.PENDING,
                amount: new client_1.Prisma.Decimal(dto.amount),
                reference: dto.reference,
                description: dto.description,
            },
            include: this.includeRelations(),
        });
    }
    async findAll(query) {
        return this.prisma.transaction.findMany({
            where: {
                userId: query.userId,
                walletId: query.walletId,
                type: query.type,
                status: query.status,
            },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async findByUser(userId) {
        return this.prisma.transaction.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async updateStatus(id, dto) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                wallet: true,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status === client_1.TransactionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Completed transaction cannot be changed');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: { id },
                data: {
                    status: dto.status,
                    description: dto.description ?? transaction.description,
                },
                include: this.includeRelations(),
            });
            if (dto.status === client_1.TransactionStatus.COMPLETED) {
                await this.applyWalletEffect(tx, {
                    walletId: transaction.walletId,
                    type: transaction.type,
                    amount: transaction.amount,
                });
            }
            return updated;
        });
    }
    async markProcessing(id) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.PENDING,
        });
    }
    async markCompleted(id) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.COMPLETED,
        });
    }
    async markFailed(id, reason) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.FAILED,
            description: reason,
        });
    }
    async markRejected(id, reason) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.REJECTED,
            description: reason,
        });
    }
    async markCancelled(id, reason) {
        return this.updateStatus(id, {
            status: client_1.TransactionStatus.CANCELLED,
            description: reason,
        });
    }
    async applyWalletEffect(tx, params) {
        const wallet = await tx.wallet.findUnique({
            where: { id: params.walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (this.isCredit(params.type)) {
            return tx.wallet.update({
                where: { id: params.walletId },
                data: {
                    balance: {
                        increment: params.amount,
                    },
                },
            });
        }
        if (this.isDebit(params.type)) {
            if (wallet.balance.lessThan(params.amount)) {
                throw new common_1.BadRequestException('Insufficient wallet balance');
            }
            return tx.wallet.update({
                where: { id: params.walletId },
                data: {
                    balance: {
                        decrement: params.amount,
                    },
                },
            });
        }
        throw new common_1.BadRequestException('Unsupported transaction type');
    }
    isCredit(type) {
        const creditTypes = [
            client_1.TransactionType.DEPOSIT,
            client_1.TransactionType.TRADE_PROFIT,
            client_1.TransactionType.BONUS,
            client_1.TransactionType.REFUND,
            client_1.TransactionType.ADMIN_ADJUSTMENT,
        ];
        return creditTypes.includes(type);
    }
    isDebit(type) {
        const debitTypes = [
            client_1.TransactionType.WITHDRAWAL,
            client_1.TransactionType.TRADE_STAKE,
        ];
        return debitTypes.includes(type);
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
            deposit: true,
            withdrawal: true,
            payout: true,
            notifications: true,
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map