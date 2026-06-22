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
const market_data_service_1 = require("../market-data/market-data.service");
const market_data_constants_1 = require("../market-data/market-data.constants");
const market_gateway_1 = require("./market.gateway");
const TICK_INTERVAL_MS = 400;
let MarketTickerService = class MarketTickerService {
    constructor(marketDataService, marketGateway) {
        this.marketDataService = marketDataService;
        this.marketGateway = marketGateway;
        this.intervalHandle = null;
    }
    onModuleInit() {
        this.intervalHandle = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    }
    onModuleDestroy() {
        if (this.intervalHandle)
            clearInterval(this.intervalHandle);
    }
    tick() {
        for (const asset of market_data_constants_1.MARKET_ASSETS) {
            if (!asset.isActive)
                continue;
            const symbolRoom = this.marketGateway.symbolRoom(asset.symbol);
            if (this.marketGateway.roomSize(symbolRoom) === 0)
                continue;
            const priceTick = this.marketDataService.getTick(asset.symbol);
            this.marketGateway.broadcastPriceUpdate({
                symbol: asset.symbol,
                price: priceTick.price,
                time: priceTick.time,
                serverTime: priceTick.serverTime,
            });
            for (const timeframe of market_data_constants_1.SUPPORTED_TIMEFRAMES) {
                const chartRoom = this.marketGateway.chartRoom(asset.symbol, timeframe);
                if (this.marketGateway.roomSize(chartRoom) === 0)
                    continue;
                const candle = this.marketDataService.getLatestCandle(asset.symbol, timeframe);
                this.marketGateway.broadcastCandleUpdate({
                    symbol: asset.symbol,
                    timeframe,
                    candle: {
                        time: candle.time,
                        open: candle.open,
                        high: candle.high,
                        low: candle.low,
                        close: candle.close,
                        volume: candle.volume,
                    },
                });
            }
        }
    }
};
exports.MarketTickerService = MarketTickerService;
exports.MarketTickerService = MarketTickerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService,
        market_gateway_1.MarketGateway])
], MarketTickerService);
//# sourceMappingURL=market-ticker.service.js.map