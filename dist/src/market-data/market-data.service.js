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
        const sampleStepMs = this.getSampleStepMs(timeframeSeconds);
        const prices = [];
        for (let sampleTime = candleStart; sampleTime <= effectiveEnd; sampleTime += sampleStepMs) {
            prices.push(this.priceAt(asset, sampleTime));
        }
        if (prices.length === 0) {
            prices.push(this.priceAt(asset, candleStart));
            prices.push(this.priceAt(asset, effectiveEnd));
        }
        const open = this.priceAt(asset, candleStart);
        const close = this.priceAt(asset, effectiveEnd);
        const bodyHigh = Math.max(...prices, open, close);
        const bodyLow = Math.min(...prices, open, close);
        const wick = this.buildRealisticWick(asset, timeframe, candleStart, bodyHigh, bodyLow, open, close);
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
        const profile = this.getAssetProfile(asset);
        const seconds = timeMs / 1000;
        const categoryMultiplier = this.getCategoryMultiplier(asset.category);
        const macroTrend = Math.sin(seconds / profile.macroCycle + profile.phaseA) *
            asset.volatility *
            profile.trendStrength *
            categoryMultiplier;
        const swing = Math.sin(seconds / profile.swingCycle + profile.phaseB) *
            asset.volatility *
            profile.swingStrength *
            categoryMultiplier;
        const pulse = Math.sin(seconds / profile.pulseCycle + profile.phaseC) *
            asset.volatility *
            profile.pulseStrength *
            categoryMultiplier;
        const micro = Math.sin(seconds / profile.microCycle + profile.phaseA * 0.37) *
            asset.volatility *
            profile.microStrength *
            categoryMultiplier;
        const smoothNoise = this.interpolatedNoise(asset.symbol, timeMs, profile.noiseBucketMs) *
            asset.volatility *
            profile.noiseStrength *
            categoryMultiplier;
        const impulse = this.impulseMove(asset, timeMs, profile) *
            asset.volatility *
            profile.impulseStrength *
            categoryMultiplier;
        const session = this.sessionPressure(asset, timeMs) *
            asset.volatility *
            categoryMultiplier;
        const structure = this.structureMove(asset, timeMs, profile) * asset.volatility;
        const totalMove = macroTrend +
            swing +
            pulse +
            micro +
            smoothNoise +
            impulse +
            session +
            structure;
        return Math.max(asset.basePrice * (1 + totalMove), asset.basePrice * 0.05);
    }
    getAssetProfile(asset) {
        const symbol = asset.symbol;
        const category = asset.category;
        const r1 = this.seededRandom(`${symbol}:profile:1`);
        const r2 = this.seededRandom(`${symbol}:profile:2`);
        const r3 = this.seededRandom(`${symbol}:profile:3`);
        const r4 = this.seededRandom(`${symbol}:profile:4`);
        const r5 = this.seededRandom(`${symbol}:profile:5`);
        const r6 = this.seededRandom(`${symbol}:profile:6`);
        const r7 = this.seededRandom(`${symbol}:profile:7`);
        const r8 = this.seededRandom(`${symbol}:profile:8`);
        const r9 = this.seededRandom(`${symbol}:profile:9`);
        const modes = [
            'TRENDING',
            'RANGING',
            'VOLATILE',
            'SPIKY',
            'STAIR_STEP',
            'REVERSAL',
        ];
        const modeIndex = Math.floor(r1 * modes.length) % modes.length;
        const trendMode = modes[modeIndex];
        let macroBase = 1800;
        let swingBase = 520;
        let pulseBase = 130;
        let microBase = 8;
        let impulseBase = 900;
        if (category === 'Cryptocurrencies') {
            macroBase = 900;
            swingBase = 280;
            pulseBase = 60;
            microBase = 4.5;
            impulseBase = 360;
        }
        if (category === 'Commodities') {
            macroBase = 2200;
            swingBase = 760;
            pulseBase = 180;
            microBase = 10;
            impulseBase = 720;
        }
        if (category === 'Stocks') {
            macroBase = 3000;
            swingBase = 1100;
            pulseBase = 280;
            microBase = 14;
            impulseBase = 1300;
        }
        if (category === 'Indices') {
            macroBase = 2400;
            swingBase = 780;
            pulseBase = 190;
            microBase = 11;
            impulseBase = 900;
        }
        let trendStrength = 0.75 + r2 * 1.25;
        let swingStrength = 0.55 + r3 * 1.3;
        let pulseStrength = 0.22 + r4 * 0.85;
        let impulseStrength = 0.08 + r5 * 0.38;
        let meanReversionStrength = 0.05 + r6 * 0.18;
        if (trendMode === 'TRENDING') {
            trendStrength *= 1.7;
            swingStrength *= 0.8;
            impulseStrength *= 0.8;
        }
        if (trendMode === 'RANGING') {
            trendStrength *= 0.45;
            swingStrength *= 1.65;
            meanReversionStrength *= 2.4;
        }
        if (trendMode === 'VOLATILE') {
            trendStrength *= 1.15;
            swingStrength *= 1.35;
            pulseStrength *= 1.9;
            impulseStrength *= 1.7;
        }
        if (trendMode === 'SPIKY') {
            trendStrength *= 0.9;
            impulseStrength *= 2.5;
            pulseStrength *= 1.4;
        }
        if (trendMode === 'STAIR_STEP') {
            trendStrength *= 1.35;
            pulseStrength *= 0.7;
            impulseStrength *= 1.2;
        }
        if (trendMode === 'REVERSAL') {
            trendStrength *= 0.9;
            swingStrength *= 1.8;
            meanReversionStrength *= 2;
        }
        return {
            trendMode,
            macroCycle: macroBase * (0.45 + r1 * 1.8),
            swingCycle: swingBase * (0.4 + r2 * 1.6),
            pulseCycle: pulseBase * (0.45 + r3 * 1.7),
            microCycle: microBase * (0.55 + r4 * 1.6),
            noiseBucketMs: Math.floor(420 + r5 * 2600),
            impulseCycle: impulseBase * (0.42 + r6 * 1.9),
            trendStrength,
            swingStrength,
            pulseStrength,
            microStrength: 0.035 + r7 * 0.16,
            noiseStrength: 0.06 + r8 * 0.24,
            impulseStrength,
            meanReversionStrength,
            direction: r9 >= 0.5 ? 1 : -1,
            phaseA: r6 * Math.PI * 2,
            phaseB: r7 * Math.PI * 2,
            phaseC: r8 * Math.PI * 2,
        };
    }
    structureMove(asset, timeMs, profile) {
        const seconds = timeMs / 1000;
        const slow = Math.sin(seconds / (profile.macroCycle * 1.7) + profile.phaseA);
        const medium = Math.sin(seconds / (profile.swingCycle * 1.2) + profile.phaseB);
        const fast = Math.sin(seconds / (profile.pulseCycle * 0.8) + profile.phaseC);
        if (profile.trendMode === 'TRENDING') {
            return (profile.direction *
                (slow * 0.9 + medium * 0.35 + fast * 0.12) *
                profile.trendStrength *
                0.35);
        }
        if (profile.trendMode === 'RANGING') {
            return ((Math.sin(seconds / profile.swingCycle + profile.phaseB) -
                slow * profile.meanReversionStrength) *
                0.35);
        }
        if (profile.trendMode === 'VOLATILE') {
            return (slow * 0.5 + medium * 0.65 + fast * 0.42) * 0.45;
        }
        if (profile.trendMode === 'SPIKY') {
            const bucket = Math.floor(seconds / profile.impulseCycle);
            const event = this.seededRandom(`${asset.symbol}:spike:${bucket}`);
            if (event < 0.62)
                return slow * 0.22;
            const progress = (seconds % profile.impulseCycle) / profile.impulseCycle;
            const spike = Math.exp(-progress * 8) * (event >= 0.81 ? 1 : -1);
            return spike * 0.9 + slow * 0.18;
        }
        if (profile.trendMode === 'STAIR_STEP') {
            const stepBucket = Math.floor(seconds / (profile.swingCycle * 0.5));
            const stepDirection = this.seededRandom(`${asset.symbol}:step:${stepBucket}`) > 0.45 ? 1 : -1;
            const stepBase = stepDirection * profile.direction * 0.35;
            return stepBase + medium * 0.14 + fast * 0.08;
        }
        const reversalPoint = Math.sin(seconds / (profile.macroCycle * 0.8) + profile.phaseC);
        return -Math.sign(reversalPoint || 1) * medium * 0.46 + slow * 0.28;
    }
    impulseMove(asset, timeMs, profile) {
        const seconds = timeMs / 1000;
        const bucket = Math.floor(seconds / profile.impulseCycle);
        const eventSeed = this.seededRandom(`${asset.symbol}:impulse:${bucket}`);
        if (eventSeed < 0.74)
            return 0;
        const directionSeed = this.seededRandom(`${asset.symbol}:impulse-dir:${bucket}`);
        const direction = directionSeed >= 0.5 ? 1 : -1;
        const progress = (seconds % profile.impulseCycle) / profile.impulseCycle;
        const attack = Math.min(progress / 0.18, 1);
        const decay = Math.max(1 - (progress - 0.18) / 0.82, 0);
        const shape = attack * decay;
        return direction * shape;
    }
    sessionPressure(asset, timeMs) {
        const hour = new Date(timeMs).getUTCHours();
        if (asset.category === 'Cryptocurrencies') {
            if (hour >= 0 && hour <= 5)
                return 0.12;
            if (hour >= 12 && hour <= 20)
                return 0.24;
            return 0.06;
        }
        if (asset.category === 'Commodities') {
            if (hour >= 6 && hour <= 11)
                return 0.08;
            if (hour >= 12 && hour <= 18)
                return 0.21;
            return -0.02;
        }
        if (asset.category === 'Stocks' || asset.category === 'Indices') {
            if (hour >= 13 && hour <= 20)
                return 0.2;
            if (hour >= 7 && hour <= 11)
                return 0.06;
            return -0.03;
        }
        if (hour >= 7 && hour <= 11)
            return 0.11;
        if (hour >= 12 && hour <= 16)
            return 0.21;
        if (hour >= 17 && hour <= 21)
            return 0.14;
        if (hour >= 0 && hour <= 5)
            return -0.05;
        return 0.02;
    }
    buildRealisticWick(asset, timeframe, candleStart, bodyHigh, bodyLow, open, close) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const profile = this.getAssetProfile(asset);
        const bodySize = Math.abs(close - open);
        const range = Math.max(bodyHigh - bodyLow, asset.basePrice * 0.00002);
        const timeframeWeight = Math.sqrt(Math.max(timeframeSeconds, 5) / 60);
        const upperSeed = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:upper`);
        const lowerSeed = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:lower`);
        let wickMultiplier = 0.18 + timeframeWeight * 0.075;
        if (profile.trendMode === 'SPIKY')
            wickMultiplier *= 2.1;
        if (profile.trendMode === 'VOLATILE')
            wickMultiplier *= 1.6;
        if (profile.trendMode === 'RANGING')
            wickMultiplier *= 1.15;
        if (asset.category === 'Cryptocurrencies')
            wickMultiplier *= 1.55;
        if (asset.category === 'Commodities')
            wickMultiplier *= 1.25;
        const maxWick = range * wickMultiplier + bodySize * 0.22 + asset.basePrice * asset.volatility * 0.004;
        return {
            high: bodyHigh + maxWick * upperSeed,
            low: bodyLow - maxWick * lowerSeed,
        };
    }
    getCategoryMultiplier(category) {
        if (category === 'Cryptocurrencies')
            return 1.55;
        if (category === 'Commodities')
            return 1.18;
        if (category === 'Stocks')
            return 0.82;
        if (category === 'Indices')
            return 0.74;
        return 1;
    }
    interpolatedNoise(key, timeMs, bucketMs) {
        const bucket = Math.floor(timeMs / bucketMs);
        const bucketStart = bucket * bucketMs;
        const progress = (timeMs - bucketStart) / bucketMs;
        const smoothProgress = progress * progress * (3 - 2 * progress);
        const current = this.seededRandom(`${key}:noise:${bucket}`);
        const next = this.seededRandom(`${key}:noise:${bucket + 1}`);
        return (current * (1 - smoothProgress) + next * smoothProgress - 0.5) * 2;
    }
    buildTickVolume(asset, timeframe, candleStart) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const profile = this.getAssetProfile(asset);
        let multiplier = 1;
        if (asset.category === 'Cryptocurrencies')
            multiplier = 2.6;
        if (asset.category === 'Commodities')
            multiplier = 1.7;
        if (asset.category === 'Indices')
            multiplier = 1.45;
        if (asset.category === 'Stocks')
            multiplier = 1.15;
        if (profile.trendMode === 'VOLATILE')
            multiplier *= 1.6;
        if (profile.trendMode === 'SPIKY')
            multiplier *= 1.9;
        const base = Math.max(10, Math.floor((timeframeSeconds / 3) * multiplier));
        const random = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:volume`);
        return Math.floor(base + random * base * 2.8);
    }
    getSampleStepMs(timeframeSeconds) {
        if (timeframeSeconds <= 5)
            return 250;
        if (timeframeSeconds <= 10)
            return 400;
        if (timeframeSeconds <= 15)
            return 600;
        if (timeframeSeconds <= 30)
            return 900;
        if (timeframeSeconds <= 60)
            return 1400;
        if (timeframeSeconds <= 120)
            return 2200;
        if (timeframeSeconds <= 180)
            return 3200;
        if (timeframeSeconds <= 300)
            return 5000;
        if (timeframeSeconds <= 600)
            return 9000;
        if (timeframeSeconds <= 900)
            return 15000;
        if (timeframeSeconds <= 1800)
            return 30000;
        if (timeframeSeconds <= 3600)
            return 60000;
        return 120000;
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
        const requested = Number(limit || 220);
        let maxLimit = 620;
        if (timeframeSeconds >= 14400)
            maxLimit = 120;
        else if (timeframeSeconds >= 3600)
            maxLimit = 160;
        else if (timeframeSeconds >= 1800)
            maxLimit = 200;
        else if (timeframeSeconds >= 900)
            maxLimit = 260;
        else if (timeframeSeconds >= 300)
            maxLimit = 320;
        return Math.min(Math.max(requested, 40), maxLimit);
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