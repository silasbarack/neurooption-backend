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
const ENGINE_INTERVAL_MS = 650;
let MarketDataService = class MarketDataService {
    constructor() {
        this.states = new Map();
        this.engineTimer = null;
    }
    onModuleInit() {
        this.engineTimer = setInterval(() => {
            this.states.forEach((state) => this.advanceState(state));
        }, ENGINE_INTERVAL_MS);
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
            }, ENGINE_INTERVAL_MS);
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
        const seedOffset = this.symbolSeed(symbol);
        const behaviour = this.createAssetBehaviour(asset, seedOffset);
        const candles = this.generateInitialCandles(asset, timeframe, behaviour, seedOffset, 120);
        const last = candles[candles.length - 1];
        const state = {
            asset,
            timeframe,
            candles,
            lastPrice: last.close,
            velocity: this.randomNormal() * asset.volatility * 0.05,
            impulse: 0,
            lastUpdate: Date.now(),
            currentCandleStart: last.time,
            behaviour,
            seedOffset,
        };
        this.states.set(key, state);
        return state;
    }
    generateInitialCandles(asset, timeframe, behaviour, seedOffset, count) {
        const candles = [];
        const durationMs = TIMEFRAME_SECONDS[timeframe] * 1000;
        const timeframeFactor = this.getTimeframeVolatilityFactor(timeframe);
        const volatility = asset.volatility * timeframeFactor;
        let price = asset.basePrice;
        let velocity = this.randomNormal() * volatility * 0.2;
        let regimeDirection = this.seededDirection(seedOffset);
        for (let index = 0; index < count; index += 1) {
            const time = Date.now() - (count - index) * durationMs;
            if (index % 18 === 0) {
                regimeDirection = this.randomNormal() >= 0 ? 1 : -1;
            }
            const regimeWave = Math.sin(index / (8 + (seedOffset % 7))) *
                volatility *
                0.42 *
                regimeDirection;
            velocity =
                velocity * behaviour.trendPersistence +
                    this.randomNormal() * volatility * behaviour.noiseStrength +
                    regimeWave * 0.16;
            const open = price;
            const bodyMove = velocity + this.randomNormal() * volatility * 0.22;
            const close = Math.max(0.00000001, open + bodyMove);
            const bodySize = Math.abs(close - open);
            const wickBase = Math.max(bodySize * 0.35, volatility * 0.22);
            const upperWick = Math.abs(this.randomNormal()) *
                wickBase *
                behaviour.wickStrength *
                (close >= open ? 0.85 : 1.18);
            const lowerWick = Math.abs(this.randomNormal()) *
                wickBase *
                behaviour.wickStrength *
                (close >= open ? 1.18 : 0.85);
            const high = Math.max(open, close) + upperWick;
            const low = Math.max(0.00000001, Math.min(open, close) - lowerWick);
            candles.push({
                symbol: asset.symbol,
                timeframe,
                time,
                open,
                high,
                low,
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
        const active = state.candles[state.candles.length - 1];
        if (!active)
            return;
        const deltaSeconds = Math.min(1.4, Math.max(0.25, (now - state.lastUpdate) / 1000));
        const durationMs = TIMEFRAME_SECONDS[state.timeframe] * 1000;
        const timeframeFactor = this.getTimeframeVolatilityFactor(state.timeframe);
        const volatility = state.asset.volatility * timeframeFactor;
        const elapsedInCandle = Math.max(0, now - state.currentCandleStart);
        const candleProgress = Math.min(1, elapsedInCandle / durationMs);
        if (Math.random() < state.behaviour.impulseChance) {
            state.impulse =
                this.randomNormal() *
                    volatility *
                    state.behaviour.impulseStrength *
                    (0.6 + candleProgress);
        }
        state.impulse *= 0.86;
        const meanPull = (state.asset.basePrice - state.lastPrice) *
            state.behaviour.meanReversion;
        const slowWave = Math.sin(now / (4200 + state.seedOffset * 11)) *
            volatility *
            0.025;
        const mediumWave = Math.sin(now / (1700 + state.seedOffset * 5)) *
            volatility *
            0.018;
        const marketNoise = this.randomNormal() *
            volatility *
            state.behaviour.noiseStrength *
            0.18;
        state.velocity =
            state.velocity * state.behaviour.trendPersistence +
                marketNoise +
                slowWave +
                mediumWave +
                state.impulse * 0.12 +
                meanPull;
        const movement = state.velocity * Math.sqrt(deltaSeconds);
        const maxTickMove = volatility * 0.34;
        const controlledMovement = this.clamp(movement, -maxTickMove, maxTickMove);
        const nextPrice = Math.max(0.00000001, state.lastPrice + controlledMovement);
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
            state.velocity *= 0.55;
            state.impulse *= 0.35;
        }
    }
    createAssetBehaviour(asset, seedOffset) {
        const personality = (seedOffset % 10) / 10;
        if (asset.category === "Currencies") {
            return {
                trendPersistence: 0.91 + personality * 0.025,
                noiseStrength: 0.55 + personality * 0.12,
                wickStrength: 1.0 + personality * 0.22,
                meanReversion: 0.000055,
                impulseChance: 0.018 + personality * 0.006,
                impulseStrength: 0.72 + personality * 0.18,
                tickIntervalMs: ENGINE_INTERVAL_MS,
            };
        }
        if (asset.category === "Cryptocurrencies") {
            return {
                trendPersistence: 0.88 + personality * 0.035,
                noiseStrength: 0.72 + personality * 0.2,
                wickStrength: 1.25 + personality * 0.35,
                meanReversion: 0.000045,
                impulseChance: 0.026 + personality * 0.012,
                impulseStrength: 0.9 + personality * 0.35,
                tickIntervalMs: ENGINE_INTERVAL_MS,
            };
        }
        if (asset.category === "Indices") {
            return {
                trendPersistence: 0.92 + personality * 0.03,
                noiseStrength: 0.5 + personality * 0.16,
                wickStrength: 0.92 + personality * 0.24,
                meanReversion: 0.000038,
                impulseChance: 0.015 + personality * 0.006,
                impulseStrength: 0.6 + personality * 0.22,
                tickIntervalMs: ENGINE_INTERVAL_MS,
            };
        }
        if (asset.category === "Stocks") {
            return {
                trendPersistence: 0.89 + personality * 0.04,
                noiseStrength: 0.62 + personality * 0.18,
                wickStrength: 1.08 + personality * 0.26,
                meanReversion: 0.00005,
                impulseChance: 0.02 + personality * 0.01,
                impulseStrength: 0.8 + personality * 0.28,
                tickIntervalMs: ENGINE_INTERVAL_MS,
            };
        }
        return {
            trendPersistence: 0.9 + personality * 0.03,
            noiseStrength: 0.58 + personality * 0.16,
            wickStrength: 1.18 + personality * 0.25,
            meanReversion: 0.000045,
            impulseChance: 0.019 + personality * 0.008,
            impulseStrength: 0.72 + personality * 0.24,
            tickIntervalMs: ENGINE_INTERVAL_MS,
        };
    }
    getTimeframeVolatilityFactor(timeframe) {
        const seconds = TIMEFRAME_SECONDS[timeframe];
        return Math.min(3.4, Math.sqrt(seconds / 60));
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
    symbolSeed(symbol) {
        let hash = 0;
        for (let index = 0; index < symbol.length; index += 1) {
            hash = (hash * 31 + symbol.charCodeAt(index)) >>> 0;
        }
        return hash % 997;
    }
    seededDirection(seed) {
        return seed % 2 === 0 ? 1 : -1;
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
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