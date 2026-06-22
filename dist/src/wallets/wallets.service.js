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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
const trading_engine_types_1 = require("../trading-engine/trading-engine.types");
let WalletsService = class WalletsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWallet(userId) {
        return this.prisma.engineWallet.findMany({
            where: { userId: userId?.trim() || 'demo-user' },
            orderBy: [{ accountType: 'asc' }, { currency: 'asc' }],
        });
    }
    async getUserWallets(userIdOrQuery = 'demo-user') {
        const userId = typeof userIdOrQuery === 'object'
            ? String(userIdOrQuery?.userId ?? 'demo-user')
            : String(userIdOrQuery ?? 'demo-user');
        return this.getWallet(userId);
    }
    async getBalance(userId, accountType = 'QT Demo', currency = 'USD') {
        const wallet = await this.ensureWallet(userId, accountType, currency);
        return this.formatWallet(wallet);
    }
    async debit(userId, accountType, amountUsd) {
        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new common_1.BadRequestException('Debit amount must be greater than zero.');
        }
        const wallet = await this.ensureWallet(userId, accountType, 'USD');
        const currentUsd = Number(wallet.balanceUsd);
        if (currentUsd < amountUsd) {
            throw new common_1.BadRequestException('Insufficient balance.');
        }
        return this.prisma.engineWallet.update({
            where: { id: wallet.id },
            data: {
                balanceUsd: new client_1.Prisma.Decimal(currentUsd - amountUsd),
                balance: new client_1.Prisma.Decimal(Number(wallet.balance) - amountUsd),
            },
        });
    }
    async credit(userId, accountType, amountUsd) {
        if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
            throw new common_1.BadRequestException('Credit amount must be greater than zero.');
        }
        const wallet = await this.ensureWallet(userId, accountType, 'USD');
        const currentUsd = Number(wallet.balanceUsd);
        return this.prisma.engineWallet.update({
            where: { id: wallet.id },
            data: {
                balanceUsd: new client_1.Prisma.Decimal(currentUsd + amountUsd),
                balance: new client_1.Prisma.Decimal(Number(wallet.balance) + amountUsd),
            },
        });
    }
    async deposit(dto) {
        const userId = String(dto?.userId ?? 'demo-user');
        const accountType = String(dto?.accountType ?? 'QT Demo');
        const currency = String(dto?.currency ?? 'USD');
        const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Deposit amount must be greater than zero.');
        }
        const amountUsd = dto?.amountUsd !== undefined ? Number(dto.amountUsd) : (0, trading_engine_types_1.currencyToUsd)(amount, currency);
        const wallet = await this.ensureWallet(userId, accountType, currency);
        const updatedWallet = await this.prisma.engineWallet.update({
            where: { id: wallet.id },
            data: {
                balanceUsd: new client_1.Prisma.Decimal(Number(wallet.balanceUsd) + amountUsd),
                balance: new client_1.Prisma.Decimal(Number(wallet.balance) + amount),
            },
        });
        return {
            message: 'Deposit completed.',
            wallet: this.formatWallet(updatedWallet),
        };
    }
    async withdraw(dto) {
        const userId = String(dto?.userId ?? 'demo-user');
        const accountType = String(dto?.accountType ?? 'QT Demo');
        const currency = String(dto?.currency ?? 'USD');
        const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Withdrawal amount must be greater than zero.');
        }
        const amountUsd = dto?.amountUsd !== undefined ? Number(dto.amountUsd) : (0, trading_engine_types_1.currencyToUsd)(amount, currency);
        const wallet = await this.ensureWallet(userId, accountType, currency);
        if (Number(wallet.balanceUsd) < amountUsd) {
            throw new common_1.BadRequestException('Insufficient balance.');
        }
        const updatedWallet = await this.prisma.engineWallet.update({
            where: { id: wallet.id },
            data: {
                balanceUsd: new client_1.Prisma.Decimal(Number(wallet.balanceUsd) - amountUsd),
                balance: new client_1.Prisma.Decimal(Number(wallet.balance) - amount),
                lockedUsd: new client_1.Prisma.Decimal(Number(wallet.lockedUsd) + amountUsd),
                locked: new client_1.Prisma.Decimal(Number(wallet.locked) + amount),
            },
        });
        return {
            message: 'Withdrawal requested.',
            wallet: this.formatWallet(updatedWallet),
        };
    }
    async markWithdrawalProcessing(id) {
        return { id, status: 'PROCESSING' };
    }
    async completeWithdrawal(id) {
        return { id, status: 'COMPLETED' };
    }
    async rejectWithdrawal(id, dto) {
        return { id, status: 'REJECTED', reason: dto?.reason ?? null };
    }
    async ensureWallet(userId, accountType = 'QT Demo', currency = 'USD') {
        const safeUserId = userId?.trim() || 'demo-user';
        const defaultUsd = accountType === 'QT Demo' ? 70000 : 0;
        const defaultBalance = (0, trading_engine_types_1.usdToCurrency)(defaultUsd, currency);
        return this.prisma.engineWallet.upsert({
            where: {
                userId_accountType_currency: {
                    userId: safeUserId,
                    accountType,
                    currency,
                },
            },
            update: {},
            create: {
                userId: safeUserId,
                accountType,
                currency,
                balance: new client_1.Prisma.Decimal(defaultBalance),
                balanceUsd: new client_1.Prisma.Decimal(defaultUsd),
                locked: new client_1.Prisma.Decimal(0),
                lockedUsd: new client_1.Prisma.Decimal(0),
            },
        });
    }
    formatWallet(wallet) {
        return {
            id: wallet.id,
            userId: wallet.userId,
            accountType: wallet.accountType,
            currency: wallet.currency,
            balance: Number(Number(wallet.balance).toFixed(2)),
            balanceUsd: Number(Number(wallet.balanceUsd).toFixed(2)),
            locked: Number(Number(wallet.locked).toFixed(2)),
            lockedUsd: Number(Number(wallet.lockedUsd).toFixed(2)),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map