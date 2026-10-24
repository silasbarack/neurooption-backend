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
exports.MarketConditionService = void 0;
const common_1 = require("@nestjs/common");
const candle_aggregator_service_1 = require("../market-data/candle-aggregator.service");
const otc_stream_engine_service_1 = require("../market-data/otc-stream-engine.service");
const payout_model_1 = require("./payout-model");
let MarketConditionService = class MarketConditionService {
    constructor(candles, otcEngine) {
        this.candles = candles;
        this.otcEngine = otcEngine;
    }
    measure(symbol, now = Date.now()) {
        const closed = (timeframe, limit) => this.candles
            .getRecentCandles(symbol, timeframe, limit + 1)
            .filter((candle) => candle.closed);
        return (0, payout_model_1.measureMarketConditions)({
            s5: closed('S5', 720),
            m1: closed('M1', 60),
            regime: this.otcEngine.drainRegimeStats(symbol),
            now,
            lastTickAt: this.candles.getLastTickTime(symbol),
            source: 'OTC_SYNTHETIC_ENGINE',
        });
    }
};
exports.MarketConditionService = MarketConditionService;
exports.MarketConditionService = MarketConditionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [candle_aggregator_service_1.CandleAggregatorService,
        otc_stream_engine_service_1.OtcStreamEngineService])
], MarketConditionService);
//# sourceMappingURL=market-condition.service.js.map