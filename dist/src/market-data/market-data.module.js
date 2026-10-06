"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataModule = void 0;
const common_1 = require("@nestjs/common");
const market_data_controller_1 = require("./market-data.controller");
const market_data_service_1 = require("./market-data.service");
const candle_aggregator_service_1 = require("./candle-aggregator.service");
const market_stream_service_1 = require("./market-stream.service");
const otc_stream_engine_service_1 = require("./otc-stream-engine.service");
const latency_metrics_service_1 = require("../monitoring/latency-metrics.service");
let MarketDataModule = class MarketDataModule {
};
exports.MarketDataModule = MarketDataModule;
exports.MarketDataModule = MarketDataModule = __decorate([
    (0, common_1.Module)({
        controllers: [market_data_controller_1.MarketDataController],
        providers: [
            market_data_service_1.MarketDataService,
            candle_aggregator_service_1.CandleAggregatorService,
            otc_stream_engine_service_1.OtcStreamEngineService,
            latency_metrics_service_1.LatencyMetricsService,
            market_stream_service_1.MarketStreamService,
        ],
        exports: [
            market_data_service_1.MarketDataService,
            candle_aggregator_service_1.CandleAggregatorService,
            market_stream_service_1.MarketStreamService,
            latency_metrics_service_1.LatencyMetricsService,
        ],
    })
], MarketDataModule);
//# sourceMappingURL=market-data.module.js.map