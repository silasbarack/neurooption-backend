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
    async create(record) {
        const transaction = await this.prisma.engineTransaction.create({
            data: {
                userId: String(record?.userId ?? 'demo-user'),
                walletId: record?.walletId === undefined ? null : String(record.walletId),
                tradeId: record?.tradeId === undefined ? null : String(record.tradeId),
                accountType: String(record?.accountType ?? 'QT Demo'),
                currency: String(record?.currency ?? 'USD'),
                type: this.normalizeType(record?.type),
                status: this.normalizeStatus(record?.status ?? 'COMPLETED'),
                amount: new client_1.Prisma.Decimal(Number(record?.amount ?? record?.amountUsd ?? 0)),
                amountUsd: new client_1.Prisma.Decimal(Number(record?.amountUsd ?? record?.amount ?? 0)),
                balanceAfter: record?.balanceAfter === undefined
                    ? undefined
                    : new client_1.Prisma.Decimal(Number(record.balanceAfter)),
                balanceAfterUsd: record?.balanceAfterUsd === undefined
                    ? undefined
                    : new client_1.Prisma.Decimal(Number(record.balanceAfterUsd)),
                description: String(record?.description ?? 'Transaction record'),
                reference: record?.reference === undefined ? undefined : String(record.reference),
                reason: record?.reason === undefined ? undefined : String(record.reason),
                metadata: record?.metadata ?? undefined,
            },
        });
        return this.formatTransaction(transaction);
    }
    async findAll(query) {
        const records = await this.prisma.engineTransaction.findMany({
            where: {
                userId: query?.userId ? String(query.userId) : undefined,
                type: query?.type ? String(query.type).toUpperCase() : undefined,
                status: query?.status ? String(query.status).toUpperCase() : undefined,
            },
            orderBy: { createdAt: 'desc' },
            take: Math.min(Number(query?.take ?? query?.limit ?? 100), 200),
            skip: Number(query?.skip ?? 0),
        });
        return records.map((record) => this.formatTransaction(record));
    }
    async findByUser(userId) {
        return this.findAll({ userId });
    }
    async findOne(id) {
        const transaction = await this.prisma.engineTransaction.findUnique({
            where: { id },
        });
        return transaction ? this.formatTransaction(transaction) : null;
    }
    async findByTrade(tradeId) {
        const records = await this.prisma.engineTransaction.findMany({
            where: { tradeId },
            orderBy: { createdAt: 'desc' },
        });
        return records.map((record) => this.formatTransaction(record));
    }
    async updateStatus(id, dto) {
        return this.patch(id, {
            status: this.normalizeStatus(dto?.status ?? dto),
            reason: dto?.reason,
        });
    }
    async markProcessing(id) {
        return this.patch(id, { status: 'PROCESSING' });
    }
    async markCompleted(id) {
        return this.patch(id, { status: 'COMPLETED' });
    }
    async markFailed(id, reason) {
        return this.patch(id, {
            status: 'FAILED',
            reason: this.extractReason(reason),
        });
    }
    async markRejected(id, reason) {
        return this.patch(id, {
            status: 'REJECTED',
            reason: this.extractReason(reason),
        });
    }
    async markCancelled(id, reason) {
        return this.patch(id, {
            status: 'CANCELLED',
            reason: this.extractReason(reason),
        });
    }
    async patch(id, patch) {
        const transaction = await this.prisma.engineTransaction.update({
            where: { id },
            data: patch,
        });
        return this.formatTransaction(transaction);
    }
    normalizeType(type) {
        const value = String(type ?? 'ADJUSTMENT').toUpperCase();
        const allowed = [
            'TRADE_STAKE',
            'TRADE_WIN_RETURN',
            'TRADE_DRAW_REFUND',
            'TRADE_LOSS',
            'DEPOSIT',
            'WITHDRAWAL',
            'ADJUSTMENT',
        ];
        return allowed.includes(value)
            ? value
            : 'ADJUSTMENT';
    }
    normalizeStatus(status) {
        const value = String(status ?? 'PENDING').toUpperCase();
        const allowed = [
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'FAILED',
            'REJECTED',
            'CANCELLED',
        ];
        return allowed.includes(value)
            ? value
            : 'PENDING';
    }
    extractReason(reasonOrDto) {
        if (reasonOrDto === undefined || reasonOrDto === null)
            return undefined;
        if (typeof reasonOrDto === 'string')
            return reasonOrDto;
        if (reasonOrDto.reason !== undefined)
            return String(reasonOrDto.reason);
        return undefined;
    }
    formatTransaction(transaction) {
        return {
            id: transaction.id,
            userId: transaction.userId,
            walletId: transaction.walletId,
            tradeId: transaction.tradeId,
            accountType: transaction.accountType,
            currency: transaction.currency,
            type: transaction.type,
            status: transaction.status,
            amount: Number(transaction.amount),
            amountUsd: Number(transaction.amountUsd),
            balanceAfter: transaction.balanceAfter === null || transaction.balanceAfter === undefined
                ? undefined
                : Number(transaction.balanceAfter),
            balanceAfterUsd: transaction.balanceAfterUsd === null || transaction.balanceAfterUsd === undefined
                ? undefined
                : Number(transaction.balanceAfterUsd),
            description: transaction.description,
            reference: transaction.reference,
            reason: transaction.reason,
            metadata: transaction.metadata,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map