"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingEngineService = void 0;
const common_1 = require("@nestjs/common");
const create_trade_dto_1 = require("./dto/create-trade.dto");
const trade_result_dto_1 = require("./dto/trade-result.dto");
let TradingEngineService = class TradingEngineService {
    constructor() {
        this.trades = [];
    }
    async createTrade(userId, dto) {
        const entryPrice = await this.getCurrentPrice(dto.symbol);
        const trade = {
            id: crypto.randomUUID(),
            userId,
            symbol: dto.symbol,
            direction: dto.direction,
            amount: dto.amount,
            expiry: dto.expiry,
            timeframe: dto.timeframe,
            marketType: dto.marketType,
            entryPrice,
            status: trade_result_dto_1.TradeStatus.OPEN,
            createdAt: new Date(),
            expiresAt: this.calculateExpiry(dto.expiry),
        };
        this.trades.push(trade);
        return trade;
    }
    async settleTrade(dto) {
        const trade = this.trades.find((t) => t.id === dto.tradeId);
        if (!trade) {
            throw new common_1.BadRequestException('Trade not found');
        }
        if (trade.status !== trade_result_dto_1.TradeStatus.OPEN) {
            throw new common_1.BadRequestException('Trade already settled');
        }
        let status;
        if (dto.closePrice === trade.entryPrice) {
            status = trade_result_dto_1.TradeStatus.DRAW;
        }
        else if (trade.direction === create_trade_dto_1.TradeDirection.BUY &&
            dto.closePrice > trade.entryPrice) {
            status = trade_result_dto_1.TradeStatus.WON;
        }
        else if (trade.direction === create_trade_dto_1.TradeDirection.SELL &&
            dto.closePrice < trade.entryPrice) {
            status = trade_result_dto_1.TradeStatus.WON;
        }
        else {
            status = trade_result_dto_1.TradeStatus.LOST;
        }
        const payoutRate = 0.85;
        const profit = status === trade_result_dto_1.TradeStatus.WON
            ? trade.amount * payoutRate
            : status === trade_result_dto_1.TradeStatus.DRAW
                ? 0
                : -trade.amount;
        trade.status = status;
        trade.closePrice = dto.closePrice;
        trade.profit = profit;
        trade.payout = status === trade_result_dto_1.TradeStatus.WON ? trade.amount + profit : 0;
        trade.settledAt = new Date();
        return trade;
    }
    async getUserTrades(userId) {
        return this.trades.filter((trade) => trade.userId === userId);
    }
    async getCurrentPrice(symbol) {
        return 100 + Math.random() * 10;
    }
    calculateExpiry(expiry) {
        const [hours, minutes, seconds] = expiry.split(':').map(Number);
        if (hours < 0 ||
            hours > 5 ||
            minutes < 0 ||
            minutes > 59 ||
            seconds < 0 ||
            seconds > 59) {
            throw new common_1.BadRequestException('Invalid expiry time');
        }
        const now = new Date();
        now.setHours(now.getHours() + hours);
        now.setMinutes(now.getMinutes() + minutes);
        now.setSeconds(now.getSeconds() + seconds);
        return now;
    }
};
exports.TradingEngineService = TradingEngineService;
exports.TradingEngineService = TradingEngineService = __decorate([
    (0, common_1.Injectable)()
], TradingEngineService);
//# sourceMappingURL=trading-engine.service.js.map