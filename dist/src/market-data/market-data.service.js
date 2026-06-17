"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const market_assets_1 = require("./market-assets");
const TIMEFRAME_SECONDS = {
    M1: 60,
    M2: 120,
    M3: 180,
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600,
    H4: 14400,
};
let MarketDataService = class MarketDataService {
    constructor() {
        this.states = new Map();
        this.engineTimer = null;
    }
    onModuleInit() {
        this.engineTimer = setInterval(() => {
            this.states.forEach((state) => this.advanceState(state));
        }, 250);
    }
    onModuleDestroy() {
        if (this.engineTimer) {
            clearInterval(this.engineTimer);
        }
    }
    getAssets(category) {
        if (!category)
            return market_assets_1.MARKET_ASSETS;
        return market_assets_1.MARKET_ASSETS.filter((asset) => asset.category === category);
    }
    getCandles(symbol, timeframe, limit = 120) {
        const state = this.getOrCreateState(symbol, timeframe);
        return state.candles.slice(-limit);
    }
    stream(symbol, timeframe) {
        const state = this.getOrCreateState(symbol, timeframe);
        return new rxjs_1.Observable((subscriber) => {
            subscriber.next({
                type: "snapshot",
                data: this.toPayload(state, "snapshot"),
            });
            const timer = setInterval(() => {
                subscriber.next({
                    type: "tick",
                    data: this.toPayload(state, "tick"),
                });
            }, 250);
            return () => {
                clearInterval(timer);
            };
        });
    }
    getOrCreateState(symbol, timeframe) {
        const asset = market_assets_1.MARKET_ASSETS.find((item) => item.symbol === symbol);
        if (!asset) {
            throw new Error(`Unknown OTC asset: ${symbol}`);
        }
        const key = `${symbol}:${timeframe}`;
        const existing = this.states.get(key);
        if (existing)
            return existing;
        const candles = this.generateInitialCandles(asset, timeframe, 120);
        const last = candles[candles.length - 1];
        const state = {
            asset,
            timeframe,
            candles,
            lastPrice: last.close,
            trend: 0,
            lastUpdate: Date.now(),
            currentCandleStart: last.time,
        };
        this.states.set(key, state);
        return state;
    }
    generateInitialCandles(asset, timeframe, count) {
        const candles = [];
        const durationMs = TIMEFRAME_SECONDS[timeframe] * 1000;
        let price = asset.basePrice;
        for (let index = 0; index < count; index += 1) {
            const time = Date.now() - (count - index) * durationMs;
            const wave = Math.sin(index / 5.2) * asset.volatility * 1.8;
            const noise = this.randomNormal() * asset.volatility * 0.9;
            const open = price;
            const close = Math.max(0.00000001, open + wave * 0.2 + noise);
            const high = Math.max(open, close) + Math.abs(this.randomNormal()) * asset.volatility * 1.2;
            const low = Math.min(open, close) - Math.abs(this.randomNormal()) * asset.volatility * 1.2;
            candles.push({
                symbol: asset.symbol,
                timeframe,
                time,
                open,
                high,
                low: Math.max(0.00000001, low),
                close,
                closed: true,
            });
            price = close;
        }
        candles[candles.length - 1].closed = false;
        return candles;
    }
    advanceState(state) {
        const now = Date.now();
        const deltaSeconds = Math.min(1, Math.max(0.05, (now - state.lastUpdate) / 1000));
        const durationMs = TIMEFRAME_SECONDS[state.timeframe] * 1000;
        const active = state.candles[state.candles.length - 1];
        if (!active)
            return;
        const meanPull = (state.asset.basePrice - state.lastPrice) * 0.0007;
        const pulse = Math.sin(now / 1300) * state.asset.volatility * 0.08;
        const microPulse = Math.sin(now / 410) * state.asset.volatility * 0.035;
        const randomImpulse = this.randomNormal() * state.asset.volatility * 0.42;
        state.trend = state.trend * 0.965 + randomImpulse * 0.035;
        const nextPrice = Math.max(0.00000001, state.lastPrice + (state.trend + meanPull + pulse + microPulse + randomImpulse) * deltaSeconds);
        state.lastPrice = nextPrice;
        state.lastUpdate = now;
        active.close = nextPrice;
        active.high = Math.max(active.high, nextPrice);
        active.low = Math.min(active.low, nextPrice);
        if (now - state.currentCandleStart >= durationMs) {
            active.closed = true;
            const newOpen = state.lastPrice;
            state.candles.push({
                symbol: state.asset.symbol,
                timeframe: state.timeframe,
                time: now,
                open: newOpen,
                high: newOpen,
                low: newOpen,
                close: newOpen,
                closed: false,
            });
            if (state.candles.length > 140) {
                state.candles.shift();
            }
            state.currentCandleStart = now;
        }
    }
    toPayload(state, type) {
        return {
            type,
            asset: state.asset,
            timeframe: state.timeframe,
            price: state.lastPrice,
            serverTime: Date.now(),
            candles: state.candles.slice(-120),
        };
    }
    randomNormal() {
        return Math.random() + Math.random() + Math.random() + Math.random() - 2;
    }
};
exports.MarketDataService = MarketDataService;
exports.MarketDataService = MarketDataService = __decorate([
    (0, common_1.Injectable)()
], MarketDataService);
//# sourceMappingURL=market-data.service.js.map