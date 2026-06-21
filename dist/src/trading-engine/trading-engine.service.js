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
const market_data_service_1 = require("../market-data/market-data.service");
const market_data_constants_1 = require("../market-data/market-data.constants");
const wallets_service_1 = require("../wallets/wallets.service");
const transactions_service_1 = require("../transactions/transactions.service");
const trades_service_1 = require("../trades/trades.service");
const trading_engine_types_1 = require("./trading-engine.types");
let TradingEngineService = class TradingEngineService {
    constructor(marketDataService, walletsService, transactionsService, tradesService) {
        this.marketDataService = marketDataService;
        this.walletsService = walletsService;
        this.transactionsService = transactionsService;
        this.tradesService = tradesService;
        this.settlementTimers = new Map();
    }
    placeTrade(dto) {
        const userId = dto.userId?.trim() || 'demo-user';
        const assetSymbol = dto.asset.trim();
        const timeframe = (dto.timeframe || 'M1').toUpperCase();
        const side = dto.side;
        const accountType = (dto.accountType || 'QT Demo');
        const currency = (dto.currency || 'USD');
        const amount = Number(dto.amount);
        const expirySeconds = Number(dto.expirySeconds);
        this.validateTradeInput({
            assetSymbol,
            timeframe,
            side,
            accountType,
            currency,
            amount,
            expirySeconds,
        });
        const asset = this.findAsset(assetSymbol);
        const entryTick = this.marketDataService.getTick(asset.symbol);
        const entryPrice = entryTick.price;
        const payoutPercent = this.calculatePayoutPercent(asset.payoutBoost, timeframe, expirySeconds);
        const stakeUsd = (0, trading_engine_types_1.currencyToUsd)(amount, currency);
        const expectedProfitAmount = amount * (payoutPercent / 100);
        const expectedReturnAmount = amount + expectedProfitAmount;
        const expectedProfitUsd = (0, trading_engine_types_1.currencyToUsd)(expectedProfitAmount, currency);
        const expectedReturnUsd = (0, trading_engine_types_1.currencyToUsd)(expectedReturnAmount, currency);
        const entryTime = Date.now();
        const expiryTime = entryTime + expirySeconds * 1000;
        this.walletsService.debit(userId, accountType, stakeUsd);
        const trade = {
            id: this.createId('trade'),
            userId,
            asset: asset.symbol,
            timeframe,
            side,
            accountType,
            currency,
            stakeAmount: Number(amount.toFixed(2)),
            stakeUsd: Number(stakeUsd.toFixed(8)),
            payoutPercent,
            expectedProfitAmount: Number(expectedProfitAmount.toFixed(2)),
            expectedProfitUsd: Number(expectedProfitUsd.toFixed(8)),
            expectedReturnAmount: Number(expectedReturnAmount.toFixed(2)),
            expectedReturnUsd: Number(expectedReturnUsd.toFixed(8)),
            entryPrice,
            entryTime,
            expirySeconds,
            expiryTime,
            status: 'PENDING',
        };
        this.tradesService.create(trade);
        this.transactionsService.create({
            userId,
            accountType,
            tradeId: trade.id,
            type: 'TRADE_STAKE',
            amountUsd: Number((-stakeUsd).toFixed(8)),
            description: `${side} stake on ${asset.symbol}`,
        });
        this.scheduleSettlement(trade.id, expiryTime);
        return {
            trade,
            wallet: this.walletsService.getBalance(userId, accountType, currency),
        };
    }
    settleTrade(tradeId) {
        const trade = this.tradesService.findById(tradeId);
        if (!trade) {
            throw new common_1.BadRequestException('Trade not found.');
        }
        if (trade.status !== 'PENDING') {
            return {
                trade,
                wallet: this.walletsService.getBalance(trade.userId, trade.accountType, trade.currency),
            };
        }
        const closeTick = this.marketDataService.getTick(trade.asset);
        const closePrice = closeTick.price;
        const status = this.calculateResultStatus(trade.side, trade.entryPrice, closePrice);
        const settlement = this.applySettlement(trade, status, closePrice);
        const updatedTrade = this.tradesService.update(trade.id, settlement);
        if (!updatedTrade) {
            throw new common_1.BadRequestException('Could not update trade.');
        }
        this.clearSettlementTimer(trade.id);
        return {
            trade: updatedTrade,
            wallet: this.walletsService.getBalance(updatedTrade.userId, updatedTrade.accountType, updatedTrade.currency),
        };
    }
    getOpenTrades(userId = 'demo-user') {
        return this.tradesService.findOpenByUser(userId);
    }
    getTradeHistory(userId = 'demo-user') {
        return this.tradesService.findHistoryByUser(userId);
    }
    getAllTrades(userId = 'demo-user') {
        return this.tradesService.findAllByUser(userId);
    }
    getWallet(userId = 'demo-user', accountType = 'QT Demo', currency = 'USD') {
        return this.walletsService.getBalance(userId, accountType, currency);
    }
    getTransactions(userId = 'demo-user') {
        return this.transactionsService.findByUser(userId);
    }
    applySettlement(trade, status, closePrice) {
        const settledAt = Date.now();
        if (status === 'WON') {
            this.walletsService.credit(trade.userId, trade.accountType, trade.expectedReturnUsd);
            this.transactionsService.create({
                userId: trade.userId,
                accountType: trade.accountType,
                tradeId: trade.id,
                type: 'TRADE_WIN_RETURN',
                amountUsd: Number(trade.expectedReturnUsd.toFixed(8)),
                description: `Winning return for ${trade.side} on ${trade.asset}`,
            });
            return {
                status,
                closePrice,
                settledAt,
                resultAmount: trade.expectedReturnAmount,
                resultUsd: trade.expectedReturnUsd,
                profitAmount: trade.expectedProfitAmount,
                profitUsd: trade.expectedProfitUsd,
            };
        }
        if (status === 'DRAW') {
            this.walletsService.credit(trade.userId, trade.accountType, trade.stakeUsd);
            this.transactionsService.create({
                userId: trade.userId,
                accountType: trade.accountType,
                tradeId: trade.id,
                type: 'TRADE_DRAW_REFUND',
                amountUsd: Number(trade.stakeUsd.toFixed(8)),
                description: `Draw refund for ${trade.side} on ${trade.asset}`,
            });
            return {
                status,
                closePrice,
                settledAt,
                resultAmount: trade.stakeAmount,
                resultUsd: trade.stakeUsd,
                profitAmount: 0,
                profitUsd: 0,
            };
        }
        this.transactionsService.create({
            userId: trade.userId,
            accountType: trade.accountType,
            tradeId: trade.id,
            type: 'TRADE_LOSS',
            amountUsd: 0,
            description: `Lost ${trade.side} trade on ${trade.asset}`,
        });
        return {
            status: 'LOST',
            closePrice,
            settledAt,
            resultAmount: 0,
            resultUsd: 0,
            profitAmount: -trade.stakeAmount,
            profitUsd: -trade.stakeUsd,
        };
    }
    calculateResultStatus(side, entryPrice, closePrice) {
        if (closePrice === entryPrice)
            return 'DRAW';
        if (side === 'BUY') {
            return closePrice > entryPrice ? 'WON' : 'LOST';
        }
        return closePrice < entryPrice ? 'WON' : 'LOST';
    }
    calculatePayoutPercent(payoutBoost, timeframe, expirySeconds) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe] ?? 60;
        let base = 84 + payoutBoost;
        if (timeframeSeconds <= 15)
            base -= 3;
        else if (timeframeSeconds <= 30)
            base -= 2;
        else if (timeframeSeconds <= 60)
            base -= 1;
        else if (timeframeSeconds >= 900)
            base += 1;
        if (expirySeconds <= 15)
            base -= 3;
        else if (expirySeconds <= 30)
            base -= 2;
        else if (expirySeconds >= 300)
            base += 1;
        return Math.min(Math.max(Math.round(base), 20), 92);
    }
    scheduleSettlement(tradeId, expiryTime) {
        this.clearSettlementTimer(tradeId);
        const delayMs = Math.max(expiryTime - Date.now(), 0);
        const timer = setTimeout(() => {
            try {
                this.settleTrade(tradeId);
            }
            catch {
            }
        }, delayMs);
        timer.unref?.();
        this.settlementTimers.set(tradeId, timer);
    }
    clearSettlementTimer(tradeId) {
        const timer = this.settlementTimers.get(tradeId);
        if (timer) {
            clearTimeout(timer);
            this.settlementTimers.delete(tradeId);
        }
    }
    validateTradeInput(input) {
        if (!input.assetSymbol) {
            throw new common_1.BadRequestException('Asset is required.');
        }
        if (!market_data_constants_1.TIMEFRAME_SECONDS[input.timeframe]) {
            throw new common_1.BadRequestException(`Unsupported timeframe: ${input.timeframe}`);
        }
        if (!['BUY', 'SELL'].includes(input.side)) {
            throw new common_1.BadRequestException('Trade side must be BUY or SELL.');
        }
        if (!['QT Demo', 'QT Real'].includes(input.accountType)) {
            throw new common_1.BadRequestException('Invalid account type.');
        }
        if (!Number.isFinite(input.amount) || input.amount <= 0) {
            throw new common_1.BadRequestException('Trade amount must be greater than zero.');
        }
        if (!Number.isFinite(input.expirySeconds) ||
            input.expirySeconds < 5 ||
            input.expirySeconds > 18000) {
            throw new common_1.BadRequestException('Expiry must be between 5 seconds and 5 hours.');
        }
    }
    findAsset(symbol) {
        const normalized = symbol.trim().toLowerCase();
        const asset = market_data_constants_1.MARKET_ASSETS.find((item) => item.symbol.toLowerCase() === normalized);
        if (!asset || !asset.isActive) {
            throw new common_1.BadRequestException(`Unsupported or inactive asset: ${symbol}`);
        }
        return asset;
    }
    createId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    }
};
exports.TradingEngineService = TradingEngineService;
exports.TradingEngineService = TradingEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService,
        wallets_service_1.WalletsService,
        transactions_service_1.TransactionsService,
        trades_service_1.TradesService])
], TradingEngineService);
//# sourceMappingURL=trading-engine.service.js.map