"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtcStreamEngineService = void 0;
const common_1 = require("@nestjs/common");
const market_data_constants_1 = require("./market-data.constants");
const FAIR_VALUE_DIFFUSION = 1.3;
let OtcStreamEngineService = class OtcStreamEngineService {
    constructor() {
        this.states = new Map();
    }
    nextTick(symbol, now = Date.now()) {
        const asset = this.findAsset(symbol);
        const state = this.getState(asset, now);
        const elapsedMs = Math.min(Math.max(now - state.lastTimestamp, 20), 1_000);
        const dtSeconds = elapsedMs / 1_000;
        const sqrtDt = Math.sqrt(dtSeconds);
        const tickSize = 10 ** -asset.precision;
        if (state.ticksInRegime >= state.regimeLength) {
            this.transitionRegime(state);
        }
        const baselineVolatility = this.baseTickVolatility(asset);
        const volatilityPersistence = 0.97;
        const volatilityResponse = asset.category === 'Currencies' ? 0.018 : 0.03;
        const targetVolatility = baselineVolatility *
            this.regimeVolatilityMultiplier(state.regime);
        state.volatility =
            volatilityPersistence * state.volatility +
                (1 - volatilityPersistence) * targetVolatility +
                volatilityResponse * state.recentAbsoluteReturn;
        state.volatility = this.clamp(state.volatility, baselineVolatility * 0.35, baselineVolatility *
            (asset.category === 'Currencies' ? 2.8 : 4.2));
        const regimeDrift = this.regimeDrift(state.regime, state.volatility, state.trend);
        const gaussian = this.randomNormal(state);
        const momentumNoise = gaussian * state.volatility * 0.045 * sqrtDt;
        state.velocity =
            state.velocity * this.regimePersistence(state.regime) +
                regimeDrift +
                momentumNoise;
        const maxVelocity = state.volatility *
            (asset.category === 'Currencies' ? 0.45 : 0.9);
        state.velocity = this.clamp(state.velocity, -maxVelocity, maxVelocity);
        const meanReversionStrength = state.regime === 'MEAN_REVERSION'
            ? 0.006
            : state.regime === 'RANGE'
                ? 0.003
                : 0.0007;
        const meanReversion = ((state.meanPrice - state.price) / Math.max(state.price, 1e-9)) *
            meanReversionStrength;
        const anchorReversion = ((asset.basePrice - state.price) / Math.max(state.price, 1e-9)) *
            (asset.category === 'Currencies' ? 0.00012 : 0.00004);
        let shock = 0;
        const shockRoll = this.nextRandom(state);
        const shockThreshold = asset.category === 'Currencies' ? 0.9999 : 0.9997;
        if (shockRoll > shockThreshold) {
            const shockDirection = this.nextRandom(state) >= 0.5 ? 1 : -1;
            const shockMultiplier = state.regime === 'HIGH_VOLATILITY' || state.regime === 'BREAKOUT'
                ? asset.category === 'Currencies'
                    ? 2.5
                    : 4
                : asset.category === 'Currencies'
                    ? 1.4
                    : 2.2;
            shock = shockDirection * state.volatility * shockMultiplier;
        }
        const rawLogReturn = state.velocity * dtSeconds +
            gaussian * state.volatility * sqrtDt * FAIR_VALUE_DIFFUSION +
            (meanReversion + anchorReversion) * dtSeconds +
            shock;
        const maxTickReturn = this.maxTickLogReturn(asset);
        const logReturn = this.clamp(rawLogReturn, -maxTickReturn, maxTickReturn);
        const previousPrice = state.price;
        state.price = Math.max(asset.basePrice * 0.05, state.price * Math.exp(logReturn));
        const absoluteReturn = Math.abs(Math.log(state.price / Math.max(previousPrice, 1e-9)));
        state.recentAbsoluteReturn =
            state.recentAbsoluteReturn * 0.9 + absoluteReturn * 0.1;
        state.meanPrice =
            state.meanPrice * 0.9995 + state.price * 0.0005;
        const spreadMultiplier = 1 +
            this.clamp(state.volatility / Math.max(baselineVolatility, 1e-12) - 1, 0, 3) *
                0.22 +
            (state.regime === 'HIGH_VOLATILITY' || state.regime === 'BREAKOUT'
                ? 0.18
                : 0);
        const targetSpread = this.baseSpread(asset) * spreadMultiplier;
        state.spread = state.spread * 0.9 + targetSpread * 0.1;
        state.quotePrice = this.nextQuotePrice(state, asset, tickSize, baselineVolatility);
        const roundedMid = this.roundToTick(state.quotePrice, tickSize);
        const roundedBid = this.roundToTick(roundedMid - state.spread / 2, tickSize);
        const roundedAsk = this.roundToTick(roundedMid + state.spread / 2, tickSize);
        state.sequence += 1;
        state.ticksInRegime += 1;
        state.lastTimestamp = now;
        return {
            symbol: asset.symbol,
            bid: roundedBid,
            ask: Math.max(roundedAsk, roundedBid + tickSize),
            mid: roundedMid,
            timestamp: now,
            sequence: state.sequence,
            source: 'neurooption-otc-simulator-v2',
            marketType: 'OTC',
        };
    }
    getLatestTick(symbol, now = Date.now()) {
        const asset = this.findAsset(symbol);
        const state = this.states.get(asset.symbol);
        if (!state || now - state.lastTimestamp >= 80) {
            return this.nextTick(asset.symbol, now);
        }
        const tickSize = 10 ** -asset.precision;
        const mid = this.roundToTick(state.quotePrice, tickSize);
        const bid = this.roundToTick(mid - state.spread / 2, tickSize);
        const ask = this.roundToTick(mid + state.spread / 2, tickSize);
        return {
            symbol: asset.symbol,
            bid,
            ask: Math.max(ask, bid + tickSize),
            mid,
            timestamp: state.lastTimestamp,
            sequence: state.sequence,
            source: 'neurooption-otc-simulator-v2',
            marketType: 'OTC',
        };
    }
    getState(asset, now) {
        const existing = this.states.get(asset.symbol);
        if (existing)
            return existing;
        const seed = this.hashString(`${asset.symbol}:${Math.floor(now / 60_000)}`);
        const state = {
            price: asset.basePrice,
            quotePrice: asset.basePrice,
            velocity: 0,
            volatility: this.baseTickVolatility(asset),
            trend: 0,
            meanPrice: asset.basePrice,
            regime: 'RANGE',
            spread: this.baseSpread(asset),
            ticksInRegime: 0,
            regimeLength: 450,
            seed,
            sequence: 0,
            lastTimestamp: now - 100,
            recentAbsoluteReturn: 0,
            microRegime: 'RANGE',
            microDirection: 0,
            microVelocity: 0,
            microTicksRemaining: 0,
            microMean: asset.basePrice,
            microImpulse: 0,
        };
        this.states.set(asset.symbol, state);
        this.transitionRegime(state);
        return state;
    }
    transitionRegime(state) {
        const previous = state.regime;
        const roll = this.nextRandom(state);
        const candidates = previous === 'HIGH_VOLATILITY'
            ? ['RANGE', 'TREND_UP', 'TREND_DOWN', 'MEAN_REVERSION', 'LOW_VOLATILITY']
            : previous === 'BREAKOUT'
                ? ['TREND_UP', 'TREND_DOWN', 'HIGH_VOLATILITY', 'MEAN_REVERSION']
                : ['TREND_UP', 'TREND_DOWN', 'RANGE', 'HIGH_VOLATILITY', 'LOW_VOLATILITY', 'BREAKOUT', 'MEAN_REVERSION'];
        const index = Math.min(candidates.length - 1, Math.floor(roll * candidates.length));
        state.regime = candidates[index];
        state.ticksInRegime = 0;
        state.regimeLength = Math.floor(180 + this.nextRandom(state) * 900);
        state.trend =
            state.regime === 'TREND_UP'
                ? 1
                : state.regime === 'TREND_DOWN'
                    ? -1
                    : state.regime === 'BREAKOUT'
                        ? this.nextRandom(state) >= 0.5
                            ? 1
                            : -1
                        : 0;
        if (state.regime === 'MEAN_REVERSION') {
            state.meanPrice = state.price;
        }
    }
    nextQuotePrice(state, asset, tickSize, baselineVolatility) {
        if (state.microTicksRemaining <= 0) {
            this.transitionMicroRegime(state);
        }
        state.microTicksRemaining -= 1;
        const typicalMoveTicks = (state.price * baselineVolatility * Math.sqrt(0.1)) / tickSize;
        const unit = tickSize * Math.max(1, Math.round(typicalMoveTicks * 0.8));
        const gapUnits = (state.price - state.quotePrice) / unit;
        const meanGapUnits = (state.microMean - state.quotePrice) / unit;
        const volatilityRatio = state.volatility / Math.max(baselineVolatility, 1e-12);
        const regimeBias = state.microRegime === 'UP' || state.microRegime === 'DOWN'
            ? 0.26
            : state.microRegime === 'RETRACE'
                ? 0.26
                : state.microRegime === 'BURST'
                    ? 0.34
                    : 0;
        state.microVelocity =
            state.microVelocity * 0.7 +
                state.microDirection * regimeBias * 0.3;
        state.microImpulse *= 0.82;
        const pull = this.clamp(gapUnits * 0.085, -0.4, 0.4) +
            (state.microRegime === 'RANGE' || state.microRegime === 'RETRACE'
                ? this.clamp(meanGapUnits * 0.05, -0.16, 0.16)
                : 0);
        const upProbability = this.clamp(0.5 + state.microVelocity + pull, 0.05, 0.95);
        let size = this.drawMicroStepSize(state, volatilityRatio);
        let direction = this.nextRandom(state) < upProbability ? 1 : -1;
        const absGap = Math.abs(gapUnits);
        if (absGap > 4 && this.nextRandom(state) < 0.75) {
            direction = gapUnits > 0 ? 1 : -1;
            size = Math.max(size, Math.round(absGap * 0.35));
        }
        size = Math.min(size, asset.category === 'Currencies' ? 8 : 10);
        if (size === 0)
            return state.quotePrice;
        return this.roundToTick(Math.max(unit, state.quotePrice + direction * size * unit), tickSize);
    }
    drawMicroStepSize(state, volatilityRatio) {
        const roll = this.nextRandom(state);
        const [still, one, two] = state.microRegime === 'RANGE'
            ? [0.22, 0.83, 0.96]
            : state.microRegime === 'BURST'
                ? [0.04, 0.34, 0.66]
                : [0.12, 0.76, 0.95];
        const quiet = this.clamp(1 - volatilityRatio, 0, 0.5);
        const busy = this.clamp(volatilityRatio - 1, 0, 1.2);
        const stillOdds = this.clamp(still + quiet * 0.3 - busy * 0.05, 0.02, 0.4);
        let size;
        if (roll < stillOdds)
            size = 0;
        else if (roll < one)
            size = 1;
        else if (roll < two)
            size = 2;
        else
            size =
                3 +
                    Math.floor(this.nextRandom(state) *
                        (state.microRegime === 'BURST' ? 5 : 3));
        if (size > 0 &&
            this.nextRandom(state) < busy * 0.12 + state.microImpulse * 0.25) {
            size += 1;
        }
        return size;
    }
    transitionMicroRegime(state) {
        const roll = this.nextRandom(state);
        const previousDirection = state.microDirection;
        if (roll < 0.3) {
            state.microRegime = 'RANGE';
            state.microDirection = 0;
            state.microTicksRemaining = 3 + Math.floor(this.nextRandom(state) * 8);
            state.microMean = state.quotePrice;
        }
        else if (roll < 0.5) {
            state.microRegime = 'UP';
            state.microDirection = 1;
            state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 6);
        }
        else if (roll < 0.7) {
            state.microRegime = 'DOWN';
            state.microDirection = -1;
            state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 6);
        }
        else if (roll < 0.95) {
            state.microRegime = 'RETRACE';
            state.microDirection =
                previousDirection === 0
                    ? this.nextRandom(state) >= 0.5
                        ? -1
                        : 1
                    : previousDirection === 1
                        ? -1
                        : 1;
            state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 4);
            state.microMean =
                state.quotePrice * 0.5 + state.microMean * 0.5;
        }
        else {
            state.microRegime = 'BURST';
            state.microDirection = this.nextRandom(state) >= 0.5 ? 1 : -1;
            state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 3);
            state.microImpulse = 1;
        }
        if (state.microRegime === 'UP' || state.microRegime === 'DOWN') {
            state.microMean = state.quotePrice;
        }
    }
    regimeDrift(regime, volatility, trend) {
        if (regime === 'TREND_UP')
            return volatility * 0.012;
        if (regime === 'TREND_DOWN')
            return -volatility * 0.012;
        if (regime === 'BREAKOUT') {
            return volatility * 0.028 * (trend === 0 ? 1 : trend);
        }
        return 0;
    }
    regimePersistence(regime) {
        if (regime === 'TREND_UP' || regime === 'TREND_DOWN')
            return 0.94;
        if (regime === 'BREAKOUT')
            return 0.9;
        if (regime === 'HIGH_VOLATILITY')
            return 0.78;
        if (regime === 'LOW_VOLATILITY')
            return 0.88;
        return 0.84;
    }
    regimeVolatilityMultiplier(regime) {
        if (regime === 'HIGH_VOLATILITY')
            return 2.25;
        if (regime === 'LOW_VOLATILITY')
            return 0.52;
        if (regime === 'BREAKOUT')
            return 1.8;
        if (regime === 'TREND_UP' || regime === 'TREND_DOWN')
            return 1.15;
        if (regime === 'MEAN_REVERSION')
            return 0.82;
        return 0.72;
    }
    baseTickVolatility(asset) {
        const categoryMultiplier = asset.category === 'Cryptocurrencies'
            ? 1.8
            : asset.category === 'Commodities'
                ? 1.3
                : asset.category === 'Indices'
                    ? 1.15
                    : asset.category === 'Stocks'
                        ? 1.2
                        : 1;
        return Math.max(asset.volatility * categoryMultiplier * 0.03, 1e-8);
    }
    maxTickLogReturn(asset) {
        if (asset.category === 'Currencies')
            return 0.00012;
        if (asset.category === 'Cryptocurrencies')
            return 0.0015;
        return 0.0008;
    }
    baseSpread(asset) {
        const tickSize = 10 ** -asset.precision;
        const ticks = asset.category === 'Currencies'
            ? asset.symbol.includes('JPY')
                ? 1.4
                : 1.8
            : asset.category === 'Cryptocurrencies'
                ? 5
                : 3;
        return tickSize * ticks;
    }
    findAsset(symbol) {
        const normalized = symbol.trim().toLowerCase();
        const asset = market_data_constants_1.MARKET_ASSETS.find((item) => item.isActive && item.symbol.toLowerCase() === normalized);
        if (!asset) {
            throw new Error(`Unsupported or inactive OTC asset: ${symbol}`);
        }
        return asset;
    }
    hashString(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index += 1) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    nextRandom(state) {
        let x = state.seed || 0x9e3779b9;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        state.seed = x >>> 0;
        return state.seed / 0xffffffff;
    }
    randomNormal(state) {
        const u1 = Math.max(this.nextRandom(state), 1e-9);
        const u2 = Math.max(this.nextRandom(state), 1e-9);
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    roundToTick(value, tickSize) {
        return Number((Math.round(value / tickSize) * tickSize).toFixed(10));
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};
exports.OtcStreamEngineService = OtcStreamEngineService;
exports.OtcStreamEngineService = OtcStreamEngineService = __decorate([
    (0, common_1.Injectable)()
], OtcStreamEngineService);
//# sourceMappingURL=otc-stream-engine.service.js.map