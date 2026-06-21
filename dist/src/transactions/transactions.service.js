"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
let TransactionsService = class TransactionsService {
    constructor() {
        this.transactions = [];
    }
    create(record) {
        const now = new Date().toISOString();
        const transaction = {
            id: String(record?.id ?? this.createId('txn')),
            userId: String(record?.userId ?? 'demo-user'),
            accountType: String(record?.accountType ?? 'QT Demo'),
            tradeId: record?.tradeId === undefined ? undefined : String(record.tradeId),
            type: this.normalizeType(record?.type),
            status: this.normalizeStatus(record?.status ?? 'COMPLETED'),
            amountUsd: Number(record?.amountUsd ?? record?.amount ?? 0),
            balanceAfterUsd: record?.balanceAfterUsd === undefined
                ? undefined
                : Number(record.balanceAfterUsd),
            description: String(record?.description ?? 'Transaction record'),
            reason: record?.reason === undefined ? undefined : String(record.reason),
            createdAt: String(record?.createdAt ?? now),
            updatedAt: String(record?.updatedAt ?? now),
        };
        this.transactions.push(transaction);
        return transaction;
    }
    findAll(query) {
        let records = [...this.transactions];
        if (query?.userId) {
            records = records.filter((transaction) => transaction.userId === String(query.userId));
        }
        if (query?.type) {
            records = records.filter((transaction) => transaction.type === String(query.type).toUpperCase());
        }
        if (query?.status) {
            records = records.filter((transaction) => transaction.status === String(query.status).toUpperCase());
        }
        return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    findByUser(userId) {
        return this.findAll({ userId });
    }
    findOne(id) {
        return this.transactions.find((transaction) => transaction.id === id) ?? null;
    }
    findByTrade(tradeId) {
        return this.transactions.filter((transaction) => transaction.tradeId === tradeId);
    }
    updateStatus(id, dto) {
        const status = this.normalizeStatus(dto?.status ?? dto);
        const reason = dto?.reason === undefined ? undefined : String(dto.reason);
        return this.patch(id, {
            status,
            reason,
        });
    }
    markProcessing(id, dto) {
        return this.patch(id, {
            status: 'PROCESSING',
            reason: this.extractReason(dto),
        });
    }
    markCompleted(id, dto) {
        return this.patch(id, {
            status: 'COMPLETED',
            reason: this.extractReason(dto),
        });
    }
    markFailed(id, reasonOrDto) {
        return this.patch(id, {
            status: 'FAILED',
            reason: this.extractReason(reasonOrDto),
        });
    }
    markRejected(id, reasonOrDto) {
        return this.patch(id, {
            status: 'REJECTED',
            reason: this.extractReason(reasonOrDto),
        });
    }
    markCancelled(id, reasonOrDto) {
        return this.patch(id, {
            status: 'CANCELLED',
            reason: this.extractReason(reasonOrDto),
        });
    }
    patch(id, patch) {
        const index = this.transactions.findIndex((transaction) => transaction.id === id);
        if (index < 0)
            return null;
        const updated = {
            ...this.transactions[index],
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        this.transactions[index] = updated;
        return updated;
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
            'WITHDRAWAL_PROCESSING',
            'WITHDRAWAL_COMPLETED',
            'WITHDRAWAL_FAILED',
            'WITHDRAWAL_REJECTED',
            'WITHDRAWAL_CANCELLED',
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
    createId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)()
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map