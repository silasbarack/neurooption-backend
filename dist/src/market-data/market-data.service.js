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
const market_data_constants_1 = require("./market-data.constants");
let MarketDataService = class MarketDataService {
    getAssets() {
        return {
            serverTime: new Date().toISOString(),
            categories: this.getCategories(),
            assets: market_data_constants_1.MARKET_ASSETS.filter((asset) => asset.isActive).map((asset) => ({
                symbol: asset.symbol,
                label: asset.label,
                category: asset.category,
                basePrice: asset.basePrice,
                precision: asset.precision,
                payoutBoost: asset.payoutBoost,
                isActive: asset.isActive,
            })),
        };
    }
    getCategories() {
        return Array.from(new Set(market_data_constants_1.MARKET_ASSETS.map((asset) => asset.category)));
    }
    getTick(assetSymbol) {
        const asset = this.findAsset(assetSymbol);
        const now = Date.now();
        const price = this.roundPrice(this.priceAt(asset, now), asset.precision);
        return {
            asset: asset.symbol,
            price,
            time: now,
            serverTime: new Date(now).toISOString(),
        };
    }
    getCandles(query) {
        const asset = this.findAsset(query.asset);
        const timeframe = this.normalizeTimeframe(query.timeframe);
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const intervalMs = timeframeSeconds * 1000;
        const limit = this.normalizeLimit(query.limit, timeframeSeconds);
        const now = Date.now();
        const currentCandleStart = Math.floor(now / intervalMs) * intervalMs;
        const firstStart = currentCandleStart - intervalMs * (limit - 1);
        const candles = [];
        for (let index = 0; index < limit; index += 1) {
            const candleStart = firstStart + index * intervalMs;
            candles.push(this.buildCandle(asset, timeframe, candleStart, now));
        }
        return {
            asset: {
                symbol: asset.symbol,
                label: asset.label,
                category: asset.category,
                basePrice: asset.basePrice,
                precision: asset.precision,
                payoutBoost: asset.payoutBoost,
                isActive: asset.isActive,
            },
            timeframe,
            timeframeSeconds,
            serverTime: new Date(now).toISOString(),
            candles,
        };
    }
    buildCandle(asset, timeframe, candleStart, now) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const intervalMs = timeframeSeconds * 1000;
        const candleEnd = candleStart + intervalMs;
        const effectiveEnd = Math.min(candleEnd, now);
        const open = this.priceAt(asset, candleStart);
        const close = this.priceAt(asset, effectiveEnd);
        const sampleStepMs = this.getSampleStepMs(timeframeSeconds);
        const prices = [open, close];
        for (let sampleTime = candleStart + sampleStepMs; sampleTime < effectiveEnd; sampleTime += sampleStepMs) {
            prices.push(this.priceAt(asset, sampleTime));
        }
        const bodyHigh = Math.max(...prices);
        const bodyLow = Math.min(...prices);
        const wick = this.buildWick(asset, timeframe, candleStart, bodyHigh, bodyLow, effectiveEnd, candleEnd);
        return {
            time: candleStart,
            openTime: new Date(candleStart).toISOString(),
            closeTime: new Date(candleEnd).toISOString(),
            open: this.roundPrice(open, asset.precision),
            high: this.roundPrice(Math.max(bodyHigh, wick.high), asset.precision),
            low: this.roundPrice(Math.min(bodyLow, wick.low), asset.precision),
            close: this.roundPrice(close, asset.precision),
            volume: this.buildTickVolume(asset, timeframe, candleStart),
        };
    }
    priceAt(asset, timeMs) {
        const seed = this.assetSeed(asset.symbol);
        const seconds = timeMs / 1000;
        const macroTrend = Math.sin(seconds / (1800 + (seed % 400)) + seed * 0.0021) *
            asset.volatility *
            1.15;
        const marketSwing = Math.sin(seconds / (520 + (seed % 120)) + seed * 0.0087) *
            asset.volatility *
            0.82;
        const intradayWave = Math.sin(seconds / (130 + (seed % 40)) + seed * 0.018) *
            asset.volatility *
            0.44;
        const tickPulse = Math.sin(seconds / (8.5 + (seed % 5)) + seed * 0.044) *
            asset.volatility *
            0.095;
        const smoothTickNoise = this.interpolatedNoise(asset.symbol, timeMs, 900) *
            asset.volatility *
            0.16;
        const sessionPressure = this.sessionVolatilityMultiplier(timeMs) * asset.volatility * 0.11;
        const totalMove = macroTrend +
            marketSwing +
            intradayWave +
            tickPulse +
            smoothTickNoise +
            sessionPressure;
        return Math.max(asset.basePrice * (1 + totalMove), asset.basePrice * 0.05);
    }
    getSampleStepMs(timeframeSeconds) {
        if (timeframeSeconds <= 5)
            return 500;
        if (timeframeSeconds <= 10)
            return 700;
        if (timeframeSeconds <= 15)
            return 900;
        if (timeframeSeconds <= 30)
            return 1500;
        if (timeframeSeconds <= 60)
            return 2500;
        if (timeframeSeconds <= 120)
            return 4000;
        if (timeframeSeconds <= 180)
            return 6000;
        if (timeframeSeconds <= 300)
            return 10000;
        if (timeframeSeconds <= 600)
            return 15000;
        if (timeframeSeconds <= 900)
            return 30000;
        if (timeframeSeconds <= 1800)
            return 60000;
        if (timeframeSeconds <= 3600)
            return 120000;
        return 300000;
    }
    buildWick(asset, timeframe, candleStart, bodyHigh, bodyLow, effectiveEnd, candleEnd) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const progress = Math.min(Math.max((effectiveEnd - candleStart) / (candleEnd - candleStart), 0.05), 1);
        const bodyRange = Math.max(bodyHigh - bodyLow, asset.basePrice * 0.000015);
        const timeframeWeight = Math.sqrt(Math.max(timeframeSeconds, 5) / 60);
        const upperRandom = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:upper-wick`);
        const lowerRandom = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:lower-wick`);
        const maxWick = (bodyRange * (0.1 + timeframeWeight * 0.06) +
            asset.basePrice * asset.volatility * 0.006) *
            progress;
        return {
            high: bodyHigh + maxWick * upperRandom,
            low: bodyLow - maxWick * lowerRandom,
        };
    }
    buildTickVolume(asset, timeframe, candleStart) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const base = Math.max(10, Math.floor(timeframeSeconds / 3));
        const random = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:volume`);
        return Math.floor(base + random * base * 2.5);
    }
    interpolatedNoise(key, timeMs, bucketMs) {
        const bucket = Math.floor(timeMs / bucketMs);
        const bucketStart = bucket * bucketMs;
        const progress = (timeMs - bucketStart) / bucketMs;
        const smoothProgress = progress * progress * (3 - 2 * progress);
        const current = this.seededRandom(`${key}:tick:${bucket}`);
        const next = this.seededRandom(`${key}:tick:${bucket + 1}`);
        return (current * (1 - smoothProgress) + next * smoothProgress - 0.5) * 2;
    }
    sessionVolatilityMultiplier(timeMs) {
        const utcHour = new Date(timeMs).getUTCHours();
        if (utcHour >= 7 && utcHour <= 11)
            return 0.14;
        if (utcHour >= 12 && utcHour <= 16)
            return 0.24;
        if (utcHour >= 17 && utcHour <= 21)
            return 0.18;
        if (utcHour >= 0 && utcHour <= 5)
            return -0.06;
        return 0.035;
    }
    seededRandom(input) {
        let hash = 2166136261;
        for (let index = 0; index < input.length; index += 1) {
            hash ^= input.charCodeAt(index);
            hash +=
                (hash << 1) +
                    (hash << 4) +
                    (hash << 7) +
                    (hash << 8) +
                    (hash << 24);
        }
        return Math.abs(hash >>> 0) / 4294967295;
    }
    assetSeed(symbol) {
        return Math.floor(this.seededRandom(symbol) * 1000000);
    }
    roundPrice(price, precision) {
        return Number(price.toFixed(precision));
    }
    normalizeTimeframe(timeframe) {
        const normalized = (timeframe || 'M1').toUpperCase();
        if (!market_data_constants_1.TIMEFRAME_SECONDS[normalized]) {
            throw new common_1.BadRequestException(`Unsupported timeframe: ${timeframe}. Supported: ${Object.keys(market_data_constants_1.TIMEFRAME_SECONDS).join(', ')}`);
        }
        return normalized;
    }
    normalizeLimit(limit, timeframeSeconds) {
        const requested = Number(limit || 180);
        let maxLimit = 500;
        if (timeframeSeconds >= 14400)
            maxLimit = 90;
        else if (timeframeSeconds >= 3600)
            maxLimit = 120;
        else if (timeframeSeconds >= 1800)
            maxLimit = 160;
        else if (timeframeSeconds >= 900)
            maxLimit = 200;
        else if (timeframeSeconds >= 300)
            maxLimit = 240;
        return Math.min(Math.max(requested, 20), maxLimit);
    }
    findAsset(symbol) {
        const normalized = symbol.trim().toLowerCase();
        const asset = market_data_constants_1.MARKET_ASSETS.find((item) => item.symbol.toLowerCase() === normalized);
        if (!asset) {
            throw new common_1.BadRequestException(`Unsupported asset: ${symbol}`);
        }
        if (!asset.isActive) {
            throw new common_1.BadRequestException(`Asset is not active: ${symbol}`);
        }
        return asset;
    }
};
exports.MarketDataService = MarketDataService;
exports.MarketDataService = MarketDataService = __decorate([
    (0, common_1.Injectable)()
], MarketDataService);
//# sourceMappingURL=market-data.service.js.map