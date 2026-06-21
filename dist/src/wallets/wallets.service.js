"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const trading_engine_types_1 = require("../trading-engine/trading-engine.types");
let WalletsService = class WalletsService {
    constructor() {
        this.wallets = new Map();
        this.withdrawals = new Map();
    }
    getWallet(userId) {
        const wallet = this.ensureWallet(userId);
        return {
            userId: wallet.userId,
            balancesUsd: { ...wallet.balancesUsd },
            updatedAt: wallet.updatedAt,
        };
    }
    getUserWallets(userIdOrQuery = 'demo-user', accountType, currency) {
        const userId = typeof userIdOrQuery === 'object'
            ? String(userIdOrQuery?.userId ?? 'demo-user')
            : String(userIdOrQuery ?? 'demo-user');
        const selectedCurrency = currency ??
            (typeof userIdOrQuery === 'object'
                ? userIdOrQuery?.currency
                : undefined) ??
            'USD';
        const wallet = this.ensureWallet(userId);
        const accountTypes = accountType
            ? [accountType]
            : ['QT Demo', 'QT Real'];
        return accountTypes.map((type) => this.getBalance(userId, type, selectedCurrency));
    }
    getBalance(userId, accountType = 'QT Demo', currency = 'USD') {
        const wallet = this.ensureWallet(userId);
        const usdBalance = wallet.balancesUsd[accountType] ?? 0;
        return {
            userId,
            accountType,
            currency,
            balanceUsd: Number(usdBalance.toFixed(2)),
            balance: Number((0, trading_engine_types_1.usdToCurrency)(usdBalance, currency).toFixed(2)),
            updatedAt: wallet.updatedAt,
        };
    }
    debit(userId, accountType, amountUsd) {
        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new common_1.BadRequestException('Debit amount must be greater than zero.');
        }
        const wallet = this.ensureWallet(userId);
        const currentBalance = wallet.balancesUsd[accountType] ?? 0;
        if (currentBalance < amountUsd) {
            throw new common_1.BadRequestException('Insufficient balance.');
        }
        wallet.balancesUsd[accountType] = Number((currentBalance - amountUsd).toFixed(8));
        wallet.updatedAt = new Date().toISOString();
        return this.getWallet(userId);
    }
    credit(userId, accountType, amountUsd) {
        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new common_1.BadRequestException('Credit amount must be greater than zero.');
        }
        const wallet = this.ensureWallet(userId);
        wallet.balancesUsd[accountType] = Number(((wallet.balancesUsd[accountType] ?? 0) + amountUsd).toFixed(8));
        wallet.updatedAt = new Date().toISOString();
        return this.getWallet(userId);
    }
    deposit(dto) {
        const userId = String(dto?.userId ?? 'demo-user');
        const accountType = String(dto?.accountType ?? 'QT Demo');
        const currency = String(dto?.currency ?? 'USD');
        const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Deposit amount must be greater than zero.');
        }
        const amountUsd = dto?.amountUsd !== undefined ? Number(dto.amountUsd) : (0, trading_engine_types_1.currencyToUsd)(amount, currency);
        this.credit(userId, accountType, amountUsd);
        return {
            message: 'Deposit completed.',
            wallet: this.getBalance(userId, accountType, currency),
        };
    }
    withdraw(dto) {
        const userId = String(dto?.userId ?? 'demo-user');
        const accountType = String(dto?.accountType ?? 'QT Demo');
        const currency = String(dto?.currency ?? 'USD');
        const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Withdrawal amount must be greater than zero.');
        }
        const amountUsd = dto?.amountUsd !== undefined ? Number(dto.amountUsd) : (0, trading_engine_types_1.currencyToUsd)(amount, currency);
        this.debit(userId, accountType, amountUsd);
        const now = new Date().toISOString();
        const withdrawal = {
            id: this.createId('wd'),
            userId,
            accountType,
            currency,
            amount,
            amountUsd,
            status: 'PENDING',
            createdAt: now,
            updatedAt: now,
        };
        this.withdrawals.set(withdrawal.id, withdrawal);
        return {
            message: 'Withdrawal requested.',
            withdrawal,
            wallet: this.getBalance(userId, accountType, currency),
        };
    }
    markWithdrawalProcessing(id, dto) {
        return this.patchWithdrawal(id, {
            status: 'PROCESSING',
            reason: this.extractReason(dto),
        });
    }
    completeWithdrawal(id, dto) {
        return this.patchWithdrawal(id, {
            status: 'COMPLETED',
            reason: this.extractReason(dto),
        });
    }
    rejectWithdrawal(id, reasonOrDto) {
        const withdrawal = this.withdrawals.get(id);
        if (!withdrawal)
            return null;
        if (withdrawal.status !== 'REJECTED' && withdrawal.status !== 'COMPLETED') {
            this.credit(withdrawal.userId, withdrawal.accountType, withdrawal.amountUsd);
        }
        return this.patchWithdrawal(id, {
            status: 'REJECTED',
            reason: this.extractReason(reasonOrDto),
        });
    }
    cancelWithdrawal(id, reasonOrDto) {
        const withdrawal = this.withdrawals.get(id);
        if (!withdrawal)
            return null;
        if (withdrawal.status !== 'CANCELLED' && withdrawal.status !== 'COMPLETED') {
            this.credit(withdrawal.userId, withdrawal.accountType, withdrawal.amountUsd);
        }
        return this.patchWithdrawal(id, {
            status: 'CANCELLED',
            reason: this.extractReason(reasonOrDto),
        });
    }
    findWithdrawal(id) {
        return this.withdrawals.get(id) ?? null;
    }
    findWithdrawals(userId) {
        const records = Array.from(this.withdrawals.values());
        if (!userId) {
            return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return records
            .filter((record) => record.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    patchWithdrawal(id, patch) {
        const existing = this.withdrawals.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        this.withdrawals.set(id, updated);
        return updated;
    }
    ensureWallet(userId) {
        const safeUserId = userId?.trim() || 'demo-user';
        const existing = this.wallets.get(safeUserId);
        if (existing)
            return existing;
        const wallet = {
            userId: safeUserId,
            balancesUsd: {
                'QT Demo': 70000,
                'QT Real': 0,
            },
            updatedAt: new Date().toISOString(),
        };
        this.wallets.set(safeUserId, wallet);
        return wallet;
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
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)()
], WalletsService);
//# sourceMappingURL=wallets.service.js.map