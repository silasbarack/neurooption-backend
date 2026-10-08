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
exports.MarketTickerService = void 0;
const common_1 = require("@nestjs/common");
const market_stream_service_1 = require("../market-data/market-stream.service");
const latency_metrics_service_1 = require("../monitoring/latency-metrics.service");
const market_gateway_1 = require("./market.gateway");
let MarketTickerService = class MarketTickerService {
    constructor(marketStreamService, marketGateway, metrics) {
        this.marketStreamService = marketStreamService;
        this.marketGateway = marketGateway;
        this.metrics = metrics;
        this.unsubscribe = null;
    }
    onModuleInit() {
        this.marketStreamService.setWatchedSymbols((symbol) => this.marketGateway.isWatched(symbol));
        this.unsubscribe = this.marketStreamService.subscribe((event) => this.broadcast(event));
    }
    onModuleDestroy() {
        this.unsubscribe?.();
        this.unsubscribe = null;
    }
    broadcast(event) {
        const { tick, candleUpdates } = event;
        const symbolRoom = this.marketGateway.symbolRoom(tick.symbol);
        if (this.marketGateway.roomSize(symbolRoom) > 0) {
            const serverBroadcastTimestamp = Date.now();
            this.marketGateway.broadcastPriceUpdate({
                symbol: tick.symbol,
                price: tick.mid,
                bid: tick.bid,
                ask: tick.ask,
                time: tick.timestamp,
                timestamp: tick.timestamp,
                sequence: tick.sequence,
                source: tick.source,
                marketType: tick.marketType,
                serverReceiveTimestamp: tick.serverReceiveTimestamp,
                serverBroadcastTimestamp,
                serverTime: new Date(serverBroadcastTimestamp).toISOString(),
            });
            this.metrics.observe('websocket_broadcast_latency_ms', Math.max(0, serverBroadcastTimestamp - tick.serverReceiveTimestamp));
        }
        for (const update of candleUpdates) {
            const chartRoom = this.marketGateway.chartRoom(update.symbol, update.timeframe);
            if (this.marketGateway.roomSize(chartRoom) === 0)
                continue;
            this.marketGateway.broadcastCandleUpdate({
                symbol: update.symbol,
                timeframe: update.timeframe,
                sequence: tick.sequence,
                serverBroadcastTimestamp: Date.now(),
                candle: {
                    time: update.candle.time,
                    open: update.candle.open,
                    high: update.candle.high,
                    low: update.candle.low,
                    close: update.candle.close,
                    volume: update.candle.volume,
                    closed: update.candle.closed,
                },
            });
        }
    }
};
exports.MarketTickerService = MarketTickerService;
exports.MarketTickerService = MarketTickerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [market_stream_service_1.MarketStreamService,
        market_gateway_1.MarketGateway,
        latency_metrics_service_1.LatencyMetricsService])
], MarketTickerService);
//# sourceMappingURL=market-ticker.service.js.map