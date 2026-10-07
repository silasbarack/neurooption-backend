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
exports.MarketStreamService = void 0;
const common_1 = require("@nestjs/common");
const market_data_constants_1 = require("./market-data.constants");
const candle_aggregator_service_1 = require("./candle-aggregator.service");
const otc_stream_engine_service_1 = require("./otc-stream-engine.service");
const latency_metrics_service_1 = require("../monitoring/latency-metrics.service");
const STREAM_INTERVAL_MS = 33;
let MarketStreamService = class MarketStreamService {
    constructor(otcEngine, candleAggregator, metrics) {
        this.otcEngine = otcEngine;
        this.candleAggregator = candleAggregator;
        this.metrics = metrics;
        this.intervalHandle = null;
        this.listeners = new Set();
        this.latestTicks = new Map();
    }
    onModuleInit() {
        this.tickAll();
        this.intervalHandle = setInterval(() => this.tickAll(), STREAM_INTERVAL_MS);
        this.intervalHandle.unref?.();
    }
    onModuleDestroy() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
        this.listeners.clear();
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    getLatestTick(symbol) {
        const cached = this.latestTicks.get(symbol);
        if (cached && Date.now() - cached.serverReceiveTimestamp <= 500) {
            return cached;
        }
        return this.generateTick(symbol);
    }
    getCandleAggregator() {
        return this.candleAggregator;
    }
    tickAll() {
        const loopStart = performance.now();
        const now = Date.now();
        for (const asset of market_data_constants_1.MARKET_ASSETS) {
            if (!asset.isActive)
                continue;
            if (!this.otcEngine.isDue(asset.symbol, now))
                continue;
            const tick = this.generateTick(asset.symbol);
            const aggregationStart = performance.now();
            const aggregation = this.candleAggregator.applyTick(tick);
            this.metrics.observe('candle_aggregation_time_ms', performance.now() - aggregationStart);
            if (aggregation.sequenceGap > 0) {
                this.metrics.increment('sequence_gaps', aggregation.sequenceGap);
            }
            if (aggregation.duplicate || aggregation.outOfOrder) {
                this.metrics.increment('ticks_dropped');
            }
            const event = {
                tick,
                candleUpdates: aggregation.updates,
            };
            for (const listener of this.listeners) {
                listener(event);
            }
        }
        const elapsed = performance.now() - loopStart;
        if (elapsed > STREAM_INTERVAL_MS) {
            this.metrics.increment('ticks_dropped');
        }
    }
    generateTick(symbol) {
        const serverReceiveTimestamp = Date.now();
        const raw = this.otcEngine.nextTick(symbol, serverReceiveTimestamp);
        const tick = {
            ...raw,
            serverReceiveTimestamp,
        };
        this.latestTicks.set(symbol, tick);
        this.metrics.markTick(serverReceiveTimestamp);
        this.metrics.observe('market_data_ingest_latency_ms', Math.max(0, serverReceiveTimestamp - tick.timestamp));
        return tick;
    }
};
exports.MarketStreamService = MarketStreamService;
exports.MarketStreamService = MarketStreamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [otc_stream_engine_service_1.OtcStreamEngineService,
        candle_aggregator_service_1.CandleAggregatorService,
        latency_metrics_service_1.LatencyMetricsService])
], MarketStreamService);
//# sourceMappingURL=market-stream.service.js.map