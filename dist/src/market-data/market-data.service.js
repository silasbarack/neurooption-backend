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
        const samples = [];
        for (let sampleTime = candleStart; sampleTime <= effectiveEnd; sampleTime += sampleStepMs) {
            samples.push(this.priceAt(asset, sampleTime));
        }
        const open = this.priceAt(asset, candleStart);
        const close = this.priceAt(asset, effectiveEnd);
        samples.push(open, close);
        const bodyHigh = Math.max(...samples);
        const bodyLow = Math.min(...samples);
        const wick = this.buildWick(asset, timeframe, candleStart, bodyHigh, bodyLow, open, close);
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
        const dna = this.getAssetDna(asset);
        const t = timeMs / 1000;
        const categoryMultiplier = this.getCategoryMultiplier(asset.category);
        const macro = Math.sin(t / dna.macroCycle + dna.phaseA) *
            asset.volatility *
            dna.macroStrength;
        const trend = Math.sin(t / dna.trendCycle + dna.phaseB) *
            asset.volatility *
            dna.trendStrength *
            dna.direction;
        const swing = Math.sin(t / dna.swingCycle + dna.phaseC) *
            asset.volatility *
            dna.swingStrength;
        const pullback = Math.sin(t / dna.pullbackCycle + dna.phaseD) *
            asset.volatility *
            dna.pullbackStrength *
            -dna.direction;
        const chop = Math.sin(t / dna.chopCycle + dna.phaseE) *
            asset.volatility *
            dna.chopStrength;
        const micro = Math.sin(t / dna.microCycle + dna.phaseA * 0.73) *
            asset.volatility *
            dna.microStrength;
        const noise = this.multiNoise(asset.symbol, timeMs, dna.noiseBucketMs) *
            asset.volatility *
            dna.noiseStrength;
        const impulse = this.impulse(asset, timeMs, dna) *
            asset.volatility *
            dna.impulseStrength;
        const regimeMove = this.regimeMove(asset, timeMs, dna) * asset.volatility;
        const sessionMove = this.sessionMove(asset, timeMs) * asset.volatility;
        const stepMove = this.stepMove(asset, timeMs, dna) * asset.volatility;
        const totalMove = (macro +
            trend +
            swing +
            pullback +
            chop +
            micro +
            noise +
            impulse +
            regimeMove +
            sessionMove +
            stepMove +
            dna.driftBias * asset.volatility) *
            categoryMultiplier;
        return Math.max(asset.basePrice * (1 + totalMove), asset.basePrice * 0.05);
    }
    getAssetDna(asset) {
        const key = asset.symbol;
        const category = asset.category;
        const r1 = this.seededRandom(`${key}:dna:1`);
        const r2 = this.seededRandom(`${key}:dna:2`);
        const r3 = this.seededRandom(`${key}:dna:3`);
        const r4 = this.seededRandom(`${key}:dna:4`);
        const r5 = this.seededRandom(`${key}:dna:5`);
        const r6 = this.seededRandom(`${key}:dna:6`);
        const r7 = this.seededRandom(`${key}:dna:7`);
        const r8 = this.seededRandom(`${key}:dna:8`);
        const r9 = this.seededRandom(`${key}:dna:9`);
        const r10 = this.seededRandom(`${key}:dna:10`);
        const r11 = this.seededRandom(`${key}:dna:11`);
        const r12 = this.seededRandom(`${key}:dna:12`);
        let regimes = [
            'FX_TREND',
            'FX_RANGE',
            'FX_BREAKOUT',
            'FX_REVERSAL',
        ];
        if (category === 'Cryptocurrencies') {
            regimes = ['CRYPTO_SPIKE', 'FX_BREAKOUT', 'FX_TREND', 'FX_REVERSAL'];
        }
        if (category === 'Commodities') {
            regimes = ['COMMODITY_SWING', 'FX_BREAKOUT', 'FX_REVERSAL', 'FX_RANGE'];
        }
        if (category === 'Indices') {
            regimes = ['INDEX_GRIND', 'FX_TREND', 'FX_RANGE', 'FX_REVERSAL'];
        }
        if (category === 'Stocks') {
            regimes = ['STOCK_STEP', 'INDEX_GRIND', 'FX_TREND', 'FX_BREAKOUT'];
        }
        const regime = regimes[Math.floor(r1 * regimes.length) % regimes.length];
        let macroBase = 2400;
        let trendBase = 1400;
        let swingBase = 520;
        let pullbackBase = 190;
        let chopBase = 42;
        let microBase = 7.5;
        let impulseBase = 820;
        let stepBase = 410;
        if (category === 'Cryptocurrencies') {
            macroBase = 900;
            trendBase = 520;
            swingBase = 210;
            pullbackBase = 72;
            chopBase = 18;
            microBase = 3.6;
            impulseBase = 260;
            stepBase = 155;
        }
        if (category === 'Commodities') {
            macroBase = 2900;
            trendBase = 1750;
            swingBase = 780;
            pullbackBase = 260;
            chopBase = 58;
            microBase = 9.5;
            impulseBase = 640;
            stepBase = 510;
        }
        if (category === 'Indices') {
            macroBase = 3100;
            trendBase = 2100;
            swingBase = 850;
            pullbackBase = 330;
            chopBase = 74;
            microBase = 11.5;
            impulseBase = 930;
            stepBase = 760;
        }
        if (category === 'Stocks') {
            macroBase = 3700;
            trendBase = 2500;
            swingBase = 1100;
            pullbackBase = 430;
            chopBase = 88;
            microBase = 14;
            impulseBase = 1250;
            stepBase = 900;
        }
        let macroStrength = 0.65 + r2 * 1.55;
        let trendStrength = 0.45 + r3 * 1.75;
        let swingStrength = 0.4 + r4 * 1.55;
        let pullbackStrength = 0.12 + r5 * 0.9;
        let chopStrength = 0.05 + r6 * 0.34;
        let impulseStrength = 0.06 + r7 * 0.55;
        let wickStrength = 0.2 + r8 * 1.1;
        if (regime === 'FX_TREND') {
            trendStrength *= 2.2;
            swingStrength *= 0.7;
            pullbackStrength *= 0.75;
            impulseStrength *= 0.75;
        }
        if (regime === 'FX_RANGE') {
            trendStrength *= 0.35;
            swingStrength *= 2.2;
            pullbackStrength *= 1.5;
            chopStrength *= 1.4;
        }
        if (regime === 'FX_BREAKOUT') {
            trendStrength *= 1.35;
            swingStrength *= 1.2;
            impulseStrength *= 2.15;
            wickStrength *= 1.4;
        }
        if (regime === 'FX_REVERSAL') {
            macroStrength *= 1.4;
            swingStrength *= 1.8;
            pullbackStrength *= 1.9;
        }
        if (regime === 'CRYPTO_SPIKE') {
            trendStrength *= 1.05;
            swingStrength *= 1.5;
            chopStrength *= 1.8;
            impulseStrength *= 3.2;
            wickStrength *= 2.4;
        }
        if (regime === 'COMMODITY_SWING') {
            macroStrength *= 1.65;
            swingStrength *= 1.7;
            impulseStrength *= 1.15;
            wickStrength *= 1.45;
        }
        if (regime === 'INDEX_GRIND') {
            trendStrength *= 1.45;
            swingStrength *= 0.95;
            chopStrength *= 0.65;
            impulseStrength *= 0.7;
            wickStrength *= 0.8;
        }
        if (regime === 'STOCK_STEP') {
            trendStrength *= 1.25;
            swingStrength *= 0.85;
            impulseStrength *= 1.4;
            wickStrength *= 0.9;
        }
        return {
            regime,
            direction: r9 >= 0.5 ? 1 : -1,
            driftBias: (r10 - 0.5) * 0.22,
            macroCycle: macroBase * (0.48 + r1 * 1.9),
            trendCycle: trendBase * (0.45 + r2 * 2.1),
            swingCycle: swingBase * (0.38 + r3 * 1.95),
            pullbackCycle: pullbackBase * (0.38 + r4 * 1.8),
            chopCycle: chopBase * (0.45 + r5 * 1.55),
            microCycle: microBase * (0.5 + r6 * 1.5),
            macroStrength,
            trendStrength,
            swingStrength,
            pullbackStrength,
            chopStrength,
            microStrength: 0.035 + r11 * 0.17,
            noiseStrength: 0.055 + r12 * 0.28,
            impulseStrength,
            wickStrength,
            noiseBucketMs: Math.floor(280 + r7 * 2800),
            impulseCycle: impulseBase * (0.35 + r8 * 2.3),
            stepCycle: stepBase * (0.45 + r9 * 2),
            phaseA: r1 * Math.PI * 2,
            phaseB: r2 * Math.PI * 2,
            phaseC: r3 * Math.PI * 2,
            phaseD: r4 * Math.PI * 2,
            phaseE: r5 * Math.PI * 2,
        };
    }
    regimeMove(asset, timeMs, dna) {
        const t = timeMs / 1000;
        const a = Math.sin(t / (dna.macroCycle * 0.82) + dna.phaseC);
        const b = Math.sin(t / (dna.swingCycle * 1.13) + dna.phaseD);
        const c = Math.sin(t / (dna.pullbackCycle * 0.77) + dna.phaseE);
        if (dna.regime === 'FX_TREND') {
            return dna.direction * (a * 0.72 + b * 0.22 + c * 0.08);
        }
        if (dna.regime === 'FX_RANGE') {
            return b * 0.82 - a * 0.28 + c * 0.12;
        }
        if (dna.regime === 'FX_BREAKOUT') {
            const bucket = Math.floor(t / dna.impulseCycle);
            const event = this.seededRandom(`${asset.symbol}:breakout:${bucket}`);
            const sign = this.seededRandom(`${asset.symbol}:breakout-dir:${bucket}`) >= 0.5
                ? 1
                : -1;
            if (event < 0.67)
                return a * 0.3 + b * 0.2;
            const progress = (t % dna.impulseCycle) / dna.impulseCycle;
            const expansion = Math.min(progress / 0.28, 1);
            return sign * expansion * 0.9 + b * 0.18;
        }
        if (dna.regime === 'FX_REVERSAL') {
            const reversal = Math.sin(t / (dna.macroCycle * 0.58) + dna.phaseA);
            return -Math.sign(reversal || 1) * b * 0.72 + a * 0.22;
        }
        if (dna.regime === 'CRYPTO_SPIKE') {
            const bucket = Math.floor(t / dna.impulseCycle);
            const event = this.seededRandom(`${asset.symbol}:crypto-spike:${bucket}`);
            if (event < 0.58)
                return a * 0.2 + b * 0.35 + c * 0.25;
            const progress = (t % dna.impulseCycle) / dna.impulseCycle;
            const spike = Math.exp(-progress * 7.5);
            const sign = event >= 0.79 ? 1 : -1;
            return sign * spike * 1.2 + c * 0.2;
        }
        if (dna.regime === 'COMMODITY_SWING') {
            return a * 0.78 + b * 0.55 - c * 0.14;
        }
        if (dna.regime === 'INDEX_GRIND') {
            return dna.direction * (a * 0.5 + b * 0.28) + c * 0.06;
        }
        const stepBucket = Math.floor(t / dna.stepCycle);
        const step = this.seededRandom(`${asset.symbol}:stock-step:${stepBucket}`) > 0.48
            ? 1
            : -1;
        return step * dna.direction * 0.36 + a * 0.22 + b * 0.12;
    }
    stepMove(asset, timeMs, dna) {
        const t = timeMs / 1000;
        const bucket = Math.floor(t / dna.stepCycle);
        const previousBucket = bucket - 1;
        const current = this.seededRandom(`${asset.symbol}:step-current:${bucket}`) - 0.5;
        const previous = this.seededRandom(`${asset.symbol}:step-current:${previousBucket}`) - 0.5;
        const progress = (t % dna.stepCycle) / dna.stepCycle;
        const smooth = progress * progress * (3 - 2 * progress);
        return (previous * (1 - smooth) + current * smooth) * 0.42;
    }
    impulse(asset, timeMs, dna) {
        const t = timeMs / 1000;
        const bucket = Math.floor(t / dna.impulseCycle);
        const seed = this.seededRandom(`${asset.symbol}:impulse:${bucket}`);
        let threshold = 0.76;
        if (dna.regime === 'CRYPTO_SPIKE')
            threshold = 0.55;
        if (dna.regime === 'FX_BREAKOUT')
            threshold = 0.62;
        if (dna.regime === 'INDEX_GRIND')
            threshold = 0.86;
        if (dna.regime === 'STOCK_STEP')
            threshold = 0.79;
        if (seed < threshold)
            return 0;
        const direction = this.seededRandom(`${asset.symbol}:impulse-direction:${bucket}`) >= 0.5
            ? 1
            : -1;
        const progress = (t % dna.impulseCycle) / dna.impulseCycle;
        const attack = Math.min(progress / 0.18, 1);
        const decay = Math.max(1 - (progress - 0.18) / 0.82, 0);
        const shape = attack * decay;
        return direction * shape;
    }
    buildWick(asset, timeframe, candleStart, bodyHigh, bodyLow, open, close) {
        const dna = this.getAssetDna(asset);
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const body = Math.abs(close - open);
        const range = Math.max(bodyHigh - bodyLow, asset.basePrice * 0.00002);
        const tfWeight = Math.sqrt(Math.max(timeframeSeconds, 5) / 60);
        const upperSeed = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:wick-upper`);
        const lowerSeed = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:wick-lower`);
        const wickBase = range * (0.12 + tfWeight * 0.065) +
            body * 0.22 +
            asset.basePrice * asset.volatility * 0.003;
        const wickSize = wickBase * dna.wickStrength;
        return {
            high: bodyHigh + wickSize * upperSeed,
            low: bodyLow - wickSize * lowerSeed,
        };
    }
    multiNoise(key, timeMs, bucketMs) {
        const n1 = this.interpolatedNoise(`${key}:n1`, timeMs, bucketMs);
        const n2 = this.interpolatedNoise(`${key}:n2`, timeMs, bucketMs * 2.7);
        const n3 = this.interpolatedNoise(`${key}:n3`, timeMs, Math.max(170, bucketMs / 2.2));
        return n1 * 0.55 + n2 * 0.28 + n3 * 0.17;
    }
    interpolatedNoise(key, timeMs, bucketMs) {
        const bucket = Math.floor(timeMs / bucketMs);
        const bucketStart = bucket * bucketMs;
        const progress = (timeMs - bucketStart) / bucketMs;
        const smooth = progress * progress * (3 - 2 * progress);
        const current = this.seededRandom(`${key}:${bucket}`);
        const next = this.seededRandom(`${key}:${bucket + 1}`);
        return (current * (1 - smooth) + next * smooth - 0.5) * 2;
    }
    sessionMove(asset, timeMs) {
        const hour = new Date(timeMs).getUTCHours();
        if (asset.category === 'Cryptocurrencies') {
            if (hour >= 0 && hour <= 5)
                return 0.1;
            if (hour >= 12 && hour <= 20)
                return 0.22;
            return 0.04;
        }
        if (asset.category === 'Commodities') {
            if (hour >= 6 && hour <= 11)
                return 0.08;
            if (hour >= 12 && hour <= 18)
                return 0.2;
            return -0.02;
        }
        if (asset.category === 'Stocks' || asset.category === 'Indices') {
            if (hour >= 13 && hour <= 20)
                return 0.18;
            if (hour >= 7 && hour <= 11)
                return 0.06;
            return -0.03;
        }
        if (hour >= 7 && hour <= 11)
            return 0.1;
        if (hour >= 12 && hour <= 16)
            return 0.2;
        if (hour >= 17 && hour <= 21)
            return 0.14;
        if (hour >= 0 && hour <= 5)
            return -0.05;
        return 0.02;
    }
    buildTickVolume(asset, timeframe, candleStart) {
        const timeframeSeconds = market_data_constants_1.TIMEFRAME_SECONDS[timeframe];
        const dna = this.getAssetDna(asset);
        let multiplier = 1;
        if (asset.category === 'Cryptocurrencies')
            multiplier = 2.8;
        if (asset.category === 'Commodities')
            multiplier = 1.8;
        if (asset.category === 'Indices')
            multiplier = 1.45;
        if (asset.category === 'Stocks')
            multiplier = 1.2;
        if (dna.regime === 'CRYPTO_SPIKE')
            multiplier *= 2;
        if (dna.regime === 'FX_BREAKOUT')
            multiplier *= 1.6;
        if (dna.regime === 'INDEX_GRIND')
            multiplier *= 0.8;
        const base = Math.max(10, Math.floor((timeframeSeconds / 3) * multiplier));
        const random = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:volume`);
        return Math.floor(base + random * base * 3);
    }
    getSampleStepMs(timeframeSeconds) {
        if (timeframeSeconds <= 5)
            return 200;
        if (timeframeSeconds <= 10)
            return 300;
        if (timeframeSeconds <= 15)
            return 450;
        if (timeframeSeconds <= 30)
            return 750;
        if (timeframeSeconds <= 60)
            return 1100;
        if (timeframeSeconds <= 120)
            return 1800;
        if (timeframeSeconds <= 180)
            return 2600;
        if (timeframeSeconds <= 300)
            return 4200;
        if (timeframeSeconds <= 600)
            return 7500;
        if (timeframeSeconds <= 900)
            return 12000;
        if (timeframeSeconds <= 1800)
            return 24000;
        if (timeframeSeconds <= 3600)
            return 48000;
        return 90000;
    }
    getCategoryMultiplier(category) {
        if (category === 'Cryptocurrencies')
            return 1.55;
        if (category === 'Commodities')
            return 1.2;
        if (category === 'Stocks')
            return 0.84;
        if (category === 'Indices')
            return 0.76;
        return 1;
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
        const requested = Number(limit || 260);
        let maxLimit = 720;
        if (timeframeSeconds >= 14400)
            maxLimit = 140;
        else if (timeframeSeconds >= 3600)
            maxLimit = 180;
        else if (timeframeSeconds >= 1800)
            maxLimit = 220;
        else if (timeframeSeconds >= 900)
            maxLimit = 290;
        else if (timeframeSeconds >= 300)
            maxLimit = 360;
        return Math.min(Math.max(requested, 60), maxLimit);
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