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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataController = void 0;
const common_1 = require("@nestjs/common");
const market_data_service_1 = require("./market-data.service");
const market_candles_query_dto_1 = require("./dto/market-candles-query.dto");
const market_tick_query_dto_1 = require("./dto/market-tick-query.dto");
const latency_metrics_service_1 = require("../monitoring/latency-metrics.service");
const payout_engine_service_1 = require("../payout-engine/payout-engine.service");
let MarketDataController = class MarketDataController {
    constructor(marketDataService, latencyMetrics, payoutEngine) {
        this.marketDataService = marketDataService;
        this.latencyMetrics = latencyMetrics;
        this.payoutEngine = payoutEngine;
    }
    getPayouts() {
        return this.marketDataService.getPayouts();
    }
    getPayoutQuote(asset, expirySeconds) {
        const seconds = Number(expirySeconds ?? 60);
        const quote = this.payoutEngine.quote(String(asset ?? ''), Number.isFinite(seconds) ? seconds : 60);
        if (!quote)
            throw new common_1.NotFoundException('Unknown asset.');
        return quote;
    }
    getPayoutDiagnostics(asset) {
        const diagnostics = this.payoutEngine.getDiagnostics(String(asset ?? ''));
        if (!diagnostics)
            throw new common_1.NotFoundException('Unknown asset.');
        return diagnostics;
    }
    async getPayoutHistory(asset, limit) {
        if (!this.payoutEngine.getSnapshot(String(asset ?? ''))) {
            throw new common_1.NotFoundException('Unknown asset.');
        }
        return {
            asset,
            history: await this.payoutEngine.getHistory(String(asset), Number(limit) || 50),
        };
    }
    getAssets() {
        return this.marketDataService.getAssets();
    }
    getQuotes() {
        return this.marketDataService.getQuotes();
    }
    getCandles(query) {
        return this.marketDataService.getCandles(query);
    }
    getTick(query) {
        return this.marketDataService.getTick(query.asset);
    }
    getMetrics() {
        return this.latencyMetrics.snapshot();
    }
};
exports.MarketDataController = MarketDataController;
__decorate([
    (0, common_1.Get)('payouts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getPayouts", null);
__decorate([
    (0, common_1.Get)('payouts/quote'),
    __param(0, (0, common_1.Query)('asset')),
    __param(1, (0, common_1.Query)('expirySeconds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getPayoutQuote", null);
__decorate([
    (0, common_1.Get)('payouts/diagnostics'),
    __param(0, (0, common_1.Query)('asset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getPayoutDiagnostics", null);
__decorate([
    (0, common_1.Get)('payouts/history'),
    __param(0, (0, common_1.Query)('asset')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MarketDataController.prototype, "getPayoutHistory", null);
__decorate([
    (0, common_1.Get)('assets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('quotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getQuotes", null);
__decorate([
    (0, common_1.Get)('candles'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [market_candles_query_dto_1.MarketCandlesQueryDto]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getCandles", null);
__decorate([
    (0, common_1.Get)('tick'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [market_tick_query_dto_1.MarketTickQueryDto]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getTick", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getMetrics", null);
exports.MarketDataController = MarketDataController = __decorate([
    (0, common_1.Controller)('market-data'),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService,
        latency_metrics_service_1.LatencyMetricsService,
        payout_engine_service_1.PayoutEngineService])
], MarketDataController);
//# sourceMappingURL=market-data.controller.js.map