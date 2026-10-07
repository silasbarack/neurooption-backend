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
const DEFAULT_FAIR_VALUE_PROFILE = {
    diffusion: FAIR_VALUE_DIFFUSION,
    anchorReversionPerSecond: 0,
    maxVelocity: 0.9,
};
const FAIR_VALUE_PROFILES = {
    Currencies: { diffusion: 0.7, anchorReversionPerSecond: 1 / 600, maxVelocity: 0.08 },
    Indices: { diffusion: 0.6, anchorReversionPerSecond: 1 / 450, maxVelocity: 0.08 },
    Stocks: { diffusion: 0.85, anchorReversionPerSecond: 1 / 900, maxVelocity: 0.15 },
};
const ANCHOR_FOLLOW_SECONDS = 7_200;
const DECISION_INTERVAL_MS = 100;
const DECISION_TOLERANCE_MS = 8;
const MAX_SUBTICKS_PER_MOVE = 4;
const SUBTICK_STALE_MS = 60;
let OtcStreamEngineService = class OtcStreamEngineService {
    constructor() {
        this.states = new Map();
    }
    isDue(symbol, now = Date.now()) {
        const state = this.states.get(this.findAsset(symbol).symbol);
        return (!state || state.pendingSteps.length > 0 || now >= state.nextDecisionAt - DECISION_TOLERANCE_MS);
    }
    decisionDue(state, now) {
        if (now - state.lastTimestamp > SUBTICK_STALE_MS)
            return true;
        return state.pendingSteps.length === 0 && now >= state.nextDecisionAt - DECISION_TOLERANCE_MS;
    }
    nextTick(symbol, now = Date.now()) {
        const asset = this.findAsset(symbol);
        const state = this.getState(asset, now);
        const tickSize = 10 ** -asset.precision;
        if (this.decisionDue(state, now)) {
            for (const step of state.pendingSteps)
                state.quotePrice += step;
            state.pendingSteps = [];
            this.decide(asset, state, now);
        }
        const step = state.pendingSteps.shift() ?? 0;
        state.quotePrice = this.roundToTick(state.quotePrice + step, tickSize);
        const roundedMid = this.roundToTick(state.quotePrice, tickSize);
        const roundedBid = this.roundToTick(roundedMid - state.spread / 2, tickSize);
        const roundedAsk = this.roundToTick(roundedMid + state.spread / 2, tickSize);
        state.sequence += 1;
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
    decide(asset, state, now) {
        const elapsedMs = Math.min(Math.max(now - state.lastDecisionAt, 20), 1_000);
        const dtSeconds = elapsedMs / 1_000;
        const sqrtDt = Math.sqrt(dtSeconds);
        const tickSize = 10 ** -asset.precision;
        if (state.ticksInRegime >= state.regimeLength) {
            this.transitionRegime(state);
        }
        const baselineVolatility = this.baseTickVolatility(asset);
        const volatilityPersistence = 0.97;
        const volatilityResponse = asset.category === 'Currencies' ? 0.018 : 0.03;
        const targetVolatility = baselineVolatility * this.regimeVolatilityMultiplier(state.regime);
        state.volatility =
            volatilityPersistence * state.volatility +
                (1 - volatilityPersistence) * targetVolatility +
                volatilityResponse * state.recentAbsoluteReturn;
        state.volatility = this.clamp(state.volatility, baselineVolatility * 0.35, baselineVolatility * (asset.category === 'Currencies' ? 2.8 : 4.2));
        const regimeDrift = this.regimeDrift(state.regime, state.volatility, state.trend);
        const gaussian = this.randomNormal(state);
        const momentumNoise = gaussian * state.volatility * 0.045 * sqrtDt;
        state.velocity =
            state.velocity * this.regimePersistence(state.regime) + regimeDrift + momentumNoise;
        const isCurrency = asset.category === 'Currencies';
        const profile = FAIR_VALUE_PROFILES[asset.category] ?? DEFAULT_FAIR_VALUE_PROFILE;
        const maxVelocity = state.volatility * profile.maxVelocity;
        state.velocity = this.clamp(state.velocity, -maxVelocity, maxVelocity);
        const meanReversionStrength = state.regime === 'MEAN_REVERSION' ? 0.006 : state.regime === 'RANGE' ? 0.003 : 0.0007;
        const meanReversion = ((state.meanPrice - state.price) / Math.max(state.price, 1e-9)) * meanReversionStrength;
        const anchorReversion = ((asset.basePrice - state.price) / Math.max(state.price, 1e-9)) *
            (isCurrency ? 0.00012 : 0.00004);
        const intradayReversion = ((state.anchorPrice - state.price) / Math.max(state.price, 1e-9)) *
            profile.anchorReversionPerSecond;
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
            gaussian * state.volatility * sqrtDt * profile.diffusion +
            (meanReversion + anchorReversion + intradayReversion) * dtSeconds +
            shock;
        const maxTickReturn = this.maxTickLogReturn(asset);
        const logReturn = this.clamp(rawLogReturn, -maxTickReturn, maxTickReturn);
        const previousPrice = state.price;
        state.price = Math.max(asset.basePrice * 0.05, state.price * Math.exp(logReturn));
        const absoluteReturn = Math.abs(Math.log(state.price / Math.max(previousPrice, 1e-9)));
        state.recentAbsoluteReturn = state.recentAbsoluteReturn * 0.9 + absoluteReturn * 0.1;
        state.meanPrice = state.meanPrice * 0.9995 + state.price * 0.0005;
        const anchorFollow = dtSeconds / ANCHOR_FOLLOW_SECONDS;
        state.anchorPrice = state.anchorPrice * (1 - anchorFollow) + state.price * anchorFollow;
        const spreadMultiplier = 1 +
            this.clamp(state.volatility / Math.max(baselineVolatility, 1e-12) - 1, 0, 3) * 0.22 +
            (state.regime === 'HIGH_VOLATILITY' || state.regime === 'BREAKOUT' ? 0.18 : 0);
        const targetSpread = this.baseSpread(asset) * spreadMultiplier;
        state.spread = state.spread * 0.9 + targetSpread * 0.1;
        state.pendingSteps = this.planQuoteMove(state, asset, tickSize, baselineVolatility);
        state.ticksInRegime += 1;
        state.lastDecisionAt = now;
        state.nextDecisionAt = now + DECISION_INTERVAL_MS;
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
            anchorPrice: asset.basePrice,
            regime: 'RANGE',
            spread: this.baseSpread(asset),
            ticksInRegime: 0,
            regimeLength: 450,
            seed,
            sequence: 0,
            lastTimestamp: now - 100,
            lastDecisionAt: now - DECISION_INTERVAL_MS,
            nextDecisionAt: now,
            pendingSteps: [],
            lastMoveDirection: 0,
            recentAbsoluteReturn: 0,
            microRegime: 'RANGE',
            microDirection: 0,
            microVelocity: 0.6,
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
                : [
                    'TREND_UP',
                    'TREND_DOWN',
                    'RANGE',
                    'HIGH_VOLATILITY',
                    'LOW_VOLATILITY',
                    'BREAKOUT',
                    'MEAN_REVERSION',
                ];
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
    planQuoteMove(state, asset, tickSize, baselineVolatility) {
        if (state.microTicksRemaining <= 0) {
            this.transitionMicroRegime(state, asset, tickSize);
        }
        state.microTicksRemaining -= 1;
        state.microImpulse *= 0.85;
        const typicalMoveTicks = (state.price * baselineVolatility * Math.sqrt(0.1)) / tickSize;
        const unit = tickSize * Math.max(1, Math.round(typicalMoveTicks * 0.8));
        const activity = this.clamp(Math.sqrt(typicalMoveTicks / 0.9), 0.5, 1);
        const gapUnits = (state.price - state.quotePrice) / unit;
        const volatilityRatio = state.volatility / Math.max(baselineVolatility, 1e-12);
        const baseMoveOdds = state.microRegime === 'BURST' ? 0.7 : state.microRegime === 'DRIFT' ? 0.31 : 0.2;
        const moveOdds = this.clamp(baseMoveOdds * activity * (0.75 + 0.25 * Math.min(volatilityRatio, 2)) +
            Math.abs(gapUnits) * 0.025 +
            state.microImpulse * 0.2, 0.08, 0.95);
        if (this.nextRandom(state) >= moveOdds)
            return [];
        let direction = state.microDirection === 0 ? (gapUnits >= 0 ? 1 : -1) : state.microDirection;
        if (this.nextRandom(state) > state.microVelocity) {
            direction = direction === 1 ? -1 : 1;
        }
        const awayFromFair = Math.sign(gapUnits) !== direction ? Math.abs(gapUnits) : 0;
        if (awayFromFair > 4 && this.nextRandom(state) < Math.min(0.85, (awayFromFair - 4) * 0.1)) {
            direction = direction === 1 ? -1 : 1;
        }
        if (state.microRegime === 'RANGE') {
            const meanGapUnits = (state.microMean - state.quotePrice) / unit;
            if (Math.sign(meanGapUnits) !== direction &&
                Math.abs(meanGapUnits) > 5 &&
                this.nextRandom(state) < 0.3) {
                direction = direction === 1 ? -1 : 1;
            }
        }
        state.microDirection = direction;
        let size = this.drawMoveSize(state, volatilityRatio);
        if (Math.abs(gapUnits) > 6 && Math.sign(gapUnits) === direction) {
            size = Math.max(size, Math.round(Math.abs(gapUnits) * 0.3));
        }
        size = Math.min(size, asset.category === 'Currencies' ? 12 : 14);
        const parts = size <= MAX_SUBTICKS_PER_MOVE
            ? size
            : this.clamp(Math.ceil(size / (1.6 + this.nextRandom(state) * 1.4)), 2, MAX_SUBTICKS_PER_MOVE);
        const base = Math.floor(size / parts);
        const extra = size % parts;
        const steps = Array.from({ length: parts }, (_, index) => direction * (base + (index < extra ? 1 : 0)) * unit);
        if (state.lastMoveDirection !== 0 && state.lastMoveDirection !== direction) {
            steps.unshift(0);
        }
        state.lastMoveDirection = direction;
        return steps;
    }
    drawMoveSize(state, volatilityRatio) {
        const roll = this.nextRandom(state);
        const spread = this.nextRandom(state);
        let size;
        if (state.microRegime === 'BURST') {
            if (roll < 0.35)
                size = 2 + Math.floor(spread * 3);
            else if (roll < 0.88)
                size = 5 + Math.floor(spread * 5);
            else
                size = 10 + Math.floor(spread * 4);
        }
        else if (state.microRegime === 'DRIFT') {
            if (roll < 0.5)
                size = 1;
            else if (roll < 0.6)
                size = 2;
            else if (roll < 0.85)
                size = 3 + Math.floor(spread * 3);
            else
                size = 6 + Math.floor(spread * 5);
        }
        else {
            if (roll < 0.74)
                size = 1;
            else if (roll < 0.94)
                size = 2;
            else
                size = 3;
        }
        const busy = this.clamp(volatilityRatio - 1, 0, 1.2);
        if (this.nextRandom(state) < busy * 0.15 + state.microImpulse * 0.3) {
            size += 1;
        }
        return size;
    }
    transitionMicroRegime(state, asset, tickSize) {
        const roll = this.nextRandom(state);
        const towardFair = state.price >= state.quotePrice ? 1 : -1;
        const randomDirection = this.nextRandom(state) >= 0.5 ? 1 : -1;
        if (roll < 0.36) {
            state.microRegime = 'RANGE';
            state.microVelocity = 0.88 + this.nextRandom(state) * 0.07;
            state.microTicksRemaining = 6 + Math.floor(this.nextRandom(state) * 20);
            state.microMean = state.quotePrice;
        }
        else if (roll < 0.86) {
            state.microRegime = 'DRIFT';
            state.microVelocity = 0.96 + this.nextRandom(state) * 0.03;
            state.microTicksRemaining = 5 + Math.floor(this.nextRandom(state) * 26);
            state.microDirection = this.nextRandom(state) < 0.65 ? towardFair : randomDirection;
        }
        else {
            state.microRegime = 'BURST';
            state.microVelocity = 0.9 + this.nextRandom(state) * 0.06;
            state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 5);
            state.microDirection = this.nextRandom(state) < 0.6 ? towardFair : randomDirection;
            state.microImpulse = 1;
        }
        const maxGap = 40 * tickSize * (asset.category === 'Currencies' ? 1 : 2);
        if (Math.abs(state.price - state.quotePrice) > maxGap) {
            state.microDirection = towardFair;
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
            ? 0.62
            : asset.category === 'Commodities'
                ? 0.72
                : asset.category === 'Indices'
                    ? 0.9
                    : asset.category === 'Stocks'
                        ? 0.68
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