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
exports.TradingEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const market_data_service_1 = require("../market-data/market-data.service");
const ACCOUNT_TYPES = {
    QT_DEMO: 'QT_DEMO',
    QT_REAL: 'QT_REAL',
};
const TRADE_SIDES = {
    BUY: 'BUY',
    SELL: 'SELL',
};
const TRADE_STATUSES = {
    OPEN: 'OPEN',
    WON: 'WON',
    LOST: 'LOST',
    DRAW: 'DRAW',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};
const TRANSACTION_TYPES = {
    TRADE_STAKE: 'TRADE_STAKE',
    TRADE_WIN: 'TRADE_WIN',
    TRADE_LOSS: 'TRADE_LOSS',
    REFUND: 'REFUND',
};
const TRANSACTION_STATUSES = {
    COMPLETED: 'COMPLETED',
};
const MIN_EXPIRY_SECONDS = 5;
const MAX_EXPIRY_SECONDS = 5 * 60 * 60;
const DEMO_INITIAL_BALANCE_USD = 70000;
const EXCHANGE_RATES = {
    USD: 1,
    KES: 129,
    UGX: 3720,
    TZS: 2550,
    NGN: 1510,
    XOF: 604,
    EUR: 0.92,
    CAD: 1.36,
    JPY: 157,
    CNY: 7.24,
    AOA: 865,
    ZAR: 18.2,
    BRL: 5.42,
};
let TradingEngineService = class TradingEngineService {
    constructor(prisma, marketDataService) {
        this.prisma = prisma;
        this.marketDataService = marketDataService;
    }
    async getWallet(query) {
        const userId = await this.resolveUserId(query.userId);
        const accountType = this.normalizeAccountType(query.accountType || 'QT_DEMO');
        const currency = this.normalizeCurrency(query.currency || 'USD');
        const wallet = await this.ensureWallet(userId, accountType, currency);
        return {
            userId,
            wallet: this.formatWallet(wallet),
        };
    }
    async openTrade(dto) {
        const userId = await this.resolveUserId(dto.userId);
        const accountType = this.normalizeAccountType(dto.accountType);
        const currency = this.normalizeCurrency(dto.currency);
        const side = this.normalizeSide(dto.side);
        const timeframe = dto.timeframe || 'M1';
        const stake = Number(dto.stake);
        const payout = Number(dto.payout);
        const expirySeconds = this.clampExpiry(Number(dto.expirySeconds));
        if (!dto.assetSymbol) {
            throw new common_1.BadRequestException('assetSymbol is required.');
        }
        if (!Number.isFinite(stake) || stake <= 0) {
            throw new common_1.BadRequestException('Stake must be greater than 0.');
        }
        if (!Number.isFinite(payout) || payout < 20 || payout > 92) {
            throw new common_1.BadRequestException('Payout must be between 20 and 92.');
        }
        const exchangeRate = EXCHANGE_RATES[currency];
        const stakeUsd = stake / exchangeRate;
        const expectedProfit = stake * (payout / 100);
        const expectedReturn = stake + expectedProfit;
        const entryPrice = await this.getLatestBackendPrice(dto.assetSymbol, timeframe);
        const openedAt = new Date();
        const expiresAt = new Date(openedAt.getTime() + expirySeconds * 1000);
        const result = await this.prisma.$transaction(async (tx) => {
            const wallet = await this.ensureWalletTx(tx, userId, accountType, currency);
            const walletBalanceUsd = Number(wallet.balanceUsd);
            if (walletBalanceUsd < stakeUsd) {
                throw new common_1.BadRequestException('Insufficient wallet balance.');
            }
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: (Number(wallet.balance) - stake).toString(),
                    balanceUsd: (walletBalanceUsd - stakeUsd).toString(),
                },
            });
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    type: TRANSACTION_TYPES.TRADE_STAKE,
                    status: TRANSACTION_STATUSES.COMPLETED,
                    accountType,
                    currency,
                    amount: stake.toString(),
                    amountUsd: stakeUsd.toString(),
                    description: `Trade stake for ${dto.assetSymbol}`,
                    metadata: {
                        assetSymbol: dto.assetSymbol,
                        side,
                        payout,
                        expirySeconds,
                        entryPrice,
                    },
                },
            });
            const trade = await tx.trade.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    assetSymbol: dto.assetSymbol,
                    assetLabel: dto.assetLabel || dto.assetSymbol,
                    timeframe,
                    side,
                    status: TRADE_STATUSES.OPEN,
                    accountType,
                    currency,
                    stake: stake.toString(),
                    stakeUsd: stakeUsd.toString(),
                    payout: payout.toString(),
                    expectedProfit: expectedProfit.toString(),
                    expectedReturn: expectedReturn.toString(),
                    entryPrice: entryPrice.toString(),
                    openedAt,
                    expiresAt,
                    metadata: {
                        source: 'BACKEND_OTC',
                        expirySeconds,
                    },
                },
            });
            return {
                trade,
                wallet: updatedWallet,
            };
        });
        return {
            message: 'Trade opened successfully.',
            userId,
            trade: this.formatTrade(result.trade),
            wallet: this.formatWallet(result.wallet),
        };
    }
    async getOpenTrades(query) {
        const userId = await this.resolveUserId(query.userId);
        await this.settleExpiredTrades(userId);
        const trades = await this.prisma.trade.findMany({
            where: {
                userId,
                status: TRADE_STATUSES.OPEN,
            },
            orderBy: { openedAt: 'desc' },
            take: this.parseLimit(query.limit),
        });
        return {
            userId,
            trades: trades.map((trade) => this.formatTrade(trade)),
        };
    }
    async getTradeHistory(query) {
        const userId = await this.resolveUserId(query.userId);
        await this.settleExpiredTrades(userId);
        const trades = await this.prisma.trade.findMany({
            where: {
                userId,
                status: {
                    not: TRADE_STATUSES.OPEN,
                },
            },
            orderBy: { openedAt: 'desc' },
            take: this.parseLimit(query.limit),
        });
        return {
            userId,
            trades: trades.map((trade) => this.formatTrade(trade)),
        };
    }
    async settleExpiredTrades(userId) {
        const now = new Date();
        const openTrades = await this.prisma.trade.findMany({
            where: {
                status: TRADE_STATUSES.OPEN,
                expiresAt: {
                    lte: now,
                },
                ...(userId ? { userId } : {}),
            },
            orderBy: { expiresAt: 'asc' },
            take: 200,
        });
        const settled = [];
        for (const trade of openTrades) {
            const result = await this.settleSingleTrade(trade.id);
            settled.push(result);
        }
        return {
            settledCount: settled.length,
            settled,
        };
    }
    async settleSingleTrade(tradeId) {
        const trade = await this.prisma.trade.findUnique({
            where: { id: tradeId },
        });
        if (!trade) {
            throw new common_1.NotFoundException('Trade not found.');
        }
        if (trade.status !== TRADE_STATUSES.OPEN) {
            return {
                trade: this.formatTrade(trade),
            };
        }
        await this.marketDataService.getCandles({
            asset: trade.assetSymbol,
            timeframe: trade.timeframe,
            limit: '5',
        });
        const expiryCandle = await this.prisma.otcCandle.findFirst({
            where: {
                assetSymbol: trade.assetSymbol,
                timeframe: trade.timeframe,
                openTime: {
                    lte: trade.expiresAt,
                },
            },
            orderBy: {
                openTime: 'desc',
            },
        });
        const closePrice = expiryCandle
            ? Number(expiryCandle.close)
            : await this.getLatestBackendPrice(trade.assetSymbol, trade.timeframe);
        const entryPrice = Number(trade.entryPrice);
        const side = trade.side;
        let status = TRADE_STATUSES.LOST;
        if (closePrice === entryPrice) {
            status = TRADE_STATUSES.DRAW;
        }
        else if (side === TRADE_SIDES.BUY && closePrice > entryPrice) {
            status = TRADE_STATUSES.WON;
        }
        else if (side === TRADE_SIDES.SELL && closePrice < entryPrice) {
            status = TRADE_STATUSES.WON;
        }
        const exchangeRate = EXCHANGE_RATES[trade.currency];
        const stake = Number(trade.stake);
        const stakeUsd = Number(trade.stakeUsd);
        const expectedReturn = Number(trade.expectedReturn);
        const expectedReturnUsd = expectedReturn / exchangeRate;
        const result = await this.prisma.$transaction(async (tx) => {
            const wallet = trade.walletId
                ? await tx.wallet.findUnique({ where: { id: trade.walletId } })
                : null;
            if (!wallet) {
                throw new common_1.BadRequestException('Trade wallet was not found.');
            }
            let returnAmount = 0;
            let returnAmountUsd = 0;
            let profitAmount = 0;
            let transactionType = TRANSACTION_TYPES.TRADE_LOSS;
            if (status === TRADE_STATUSES.WON) {
                returnAmount = expectedReturn;
                returnAmountUsd = expectedReturnUsd;
                profitAmount = Number(trade.expectedProfit);
                transactionType = TRANSACTION_TYPES.TRADE_WIN;
            }
            if (status === TRADE_STATUSES.DRAW) {
                returnAmount = stake;
                returnAmountUsd = stakeUsd;
                profitAmount = 0;
                transactionType = TRANSACTION_TYPES.REFUND;
            }
            let updatedWallet = wallet;
            if (returnAmount > 0) {
                updatedWallet = await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        balance: (Number(wallet.balance) + returnAmount).toString(),
                        balanceUsd: (Number(wallet.balanceUsd) + returnAmountUsd).toString(),
                    },
                });
            }
            const updatedTrade = await tx.trade.update({
                where: { id: trade.id },
                data: {
                    status,
                    closePrice: closePrice.toString(),
                    closedAt: new Date(),
                    profitAmount: profitAmount.toString(),
                    returnAmount: returnAmount.toString(),
                    metadata: this.mergeMetadata(trade.metadata, {
                        settlementSource: 'BACKEND_OTC',
                        settledAt: new Date().toISOString(),
                    }),
                },
            });
            await tx.transaction.create({
                data: {
                    userId: trade.userId,
                    walletId: wallet.id,
                    type: transactionType,
                    status: TRANSACTION_STATUSES.COMPLETED,
                    accountType: trade.accountType,
                    currency: trade.currency,
                    amount: returnAmount.toString(),
                    amountUsd: returnAmountUsd.toString(),
                    description: `Trade ${status.toLowerCase()} for ${trade.assetSymbol}`,
                    metadata: {
                        tradeId: trade.id,
                        assetSymbol: trade.assetSymbol,
                        side: trade.side,
                        entryPrice,
                        closePrice,
                        result: status,
                    },
                },
            });
            return {
                trade: updatedTrade,
                wallet: updatedWallet,
            };
        });
        return {
            trade: this.formatTrade(result.trade),
            wallet: this.formatWallet(result.wallet),
        };
    }
    async getLatestBackendPrice(assetSymbol, timeframe) {
        const candleResponse = await this.marketDataService.getCandles({
            asset: assetSymbol,
            timeframe,
            limit: '3',
        });
        const latest = candleResponse.candles[candleResponse.candles.length - 1];
        if (!latest) {
            throw new common_1.BadRequestException('No backend candle price available.');
        }
        return Number(latest.close);
    }
    async resolveUserId(userId) {
        if (userId) {
            const existingUser = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!existingUser) {
                throw new common_1.NotFoundException('User not found.');
            }
            return existingUser.id;
        }
        const demoUser = await this.prisma.user.upsert({
            where: { email: 'demo@neurooption.local' },
            update: {},
            create: {
                email: 'demo@neurooption.local',
                fullName: 'NeuroOption Demo User',
            },
        });
        return demoUser.id;
    }
    async ensureWallet(userId, accountType, currency) {
        return this.ensureWalletTx(this.prisma, userId, accountType, currency);
    }
    async ensureWalletTx(tx, userId, accountType, currency) {
        const existingWallet = await tx.wallet.findUnique({
            where: {
                userId_accountType_currency: {
                    userId,
                    accountType,
                    currency,
                },
            },
        });
        if (existingWallet) {
            return existingWallet;
        }
        const exchangeRate = EXCHANGE_RATES[currency];
        const initialBalanceUsd = accountType === ACCOUNT_TYPES.QT_DEMO ? DEMO_INITIAL_BALANCE_USD : 0;
        const initialBalance = initialBalanceUsd * exchangeRate;
        return tx.wallet.create({
            data: {
                userId,
                accountType,
                currency,
                balance: initialBalance.toString(),
                balanceUsd: initialBalanceUsd.toString(),
            },
        });
    }
    normalizeAccountType(value) {
        if (value === 'QT_REAL' || value === 'QT Real') {
            return ACCOUNT_TYPES.QT_REAL;
        }
        return ACCOUNT_TYPES.QT_DEMO;
    }
    normalizeCurrency(value) {
        const currencies = Object.keys(EXCHANGE_RATES);
        if (!currencies.includes(value)) {
            throw new common_1.BadRequestException(`Unsupported currency: ${value}`);
        }
        return value;
    }
    normalizeSide(value) {
        if (value === TRADE_SIDES.SELL)
            return TRADE_SIDES.SELL;
        if (value === TRADE_SIDES.BUY)
            return TRADE_SIDES.BUY;
        throw new common_1.BadRequestException('Trade side must be BUY or SELL.');
    }
    clampExpiry(value) {
        if (!Number.isFinite(value))
            return 45;
        return Math.min(Math.max(Math.floor(value), MIN_EXPIRY_SECONDS), MAX_EXPIRY_SECONDS);
    }
    parseLimit(value) {
        const parsed = Number(value || 50);
        if (!Number.isFinite(parsed))
            return 50;
        return Math.min(Math.max(Math.floor(parsed), 1), 200);
    }
    mergeMetadata(existing, next) {
        if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
            return {
                ...existing,
                ...next,
            };
        }
        return next;
    }
    formatWallet(wallet) {
        return {
            id: wallet.id,
            userId: wallet.userId,
            accountType: wallet.accountType,
            currency: wallet.currency,
            balance: Number(wallet.balance),
            balanceUsd: Number(wallet.balanceUsd),
            isActive: wallet.isActive,
            createdAt: wallet.createdAt?.toISOString?.() ?? wallet.createdAt,
            updatedAt: wallet.updatedAt?.toISOString?.() ?? wallet.updatedAt,
        };
    }
    formatTrade(trade) {
        return {
            id: trade.id,
            userId: trade.userId,
            walletId: trade.walletId,
            assetSymbol: trade.assetSymbol,
            assetLabel: trade.assetLabel,
            timeframe: trade.timeframe,
            side: trade.side,
            status: trade.status,
            accountType: trade.accountType,
            currency: trade.currency,
            stake: Number(trade.stake),
            stakeUsd: Number(trade.stakeUsd),
            payout: Number(trade.payout),
            expectedProfit: Number(trade.expectedProfit),
            expectedReturn: Number(trade.expectedReturn),
            entryPrice: Number(trade.entryPrice),
            closePrice: trade.closePrice ? Number(trade.closePrice) : null,
            openedAt: trade.openedAt?.toISOString?.() ?? trade.openedAt,
            expiresAt: trade.expiresAt?.toISOString?.() ?? trade.expiresAt,
            closedAt: trade.closedAt?.toISOString?.() ?? null,
            profitAmount: trade.profitAmount ? Number(trade.profitAmount) : null,
            returnAmount: trade.returnAmount ? Number(trade.returnAmount) : null,
            metadata: trade.metadata,
        };
    }
};
exports.TradingEngineService = TradingEngineService;
exports.TradingEngineService = TradingEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        market_data_service_1.MarketDataService])
], TradingEngineService);
//# sourceMappingURL=trading-engine.service.js.map