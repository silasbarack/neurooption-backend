"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandleAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const timeframe_config_1 = require("./timeframe.config");
const MAX_HISTORY_PER_STREAM = 720;
const OUT_OF_ORDER_TOLERANCE_MS = 1_500;
let CandleAggregatorService = class CandleAggregatorService {
    constructor() {
        this.active = new Map();
        this.history = new Map();
        this.lastSequence = new Map();
        this.lastTimestamp = new Map();
    }
    applyTick(tick) {
        const previousSequence = this.lastSequence.get(tick.symbol);
        const previousTimestamp = this.lastTimestamp.get(tick.symbol);
        if (previousSequence !== undefined && tick.sequence <= previousSequence) {
            return {
                updates: [],
                duplicate: true,
                outOfOrder: tick.sequence < previousSequence,
                sequenceGap: 0,
            };
        }
        if (previousTimestamp !== undefined &&
            tick.timestamp + OUT_OF_ORDER_TOLERANCE_MS < previousTimestamp) {
            return {
                updates: [],
                duplicate: false,
                outOfOrder: true,
                sequenceGap: 0,
            };
        }
        const sequenceGap = previousSequence === undefined
            ? 0
            : Math.max(0, tick.sequence - previousSequence - 1);
        const delayedWithinTolerance = previousTimestamp !== undefined && tick.timestamp < previousTimestamp;
        this.lastSequence.set(tick.symbol, tick.sequence);
        this.lastTimestamp.set(tick.symbol, Math.max(previousTimestamp ?? tick.timestamp, tick.timestamp));
        const updates = [];
        for (const timeframe of timeframe_config_1.SUPPORTED_TIMEFRAMES) {
            const key = this.key(tick.symbol, timeframe);
            const bucketStart = (0, timeframe_config_1.timeframeBucketStart)(tick.timestamp, timeframe);
            const current = this.active.get(key);
            if (!current || bucketStart > current.time) {
                if (current) {
                    this.archive(key, { ...current, closed: true });
                }
                const next = this.createCandle(timeframe, bucketStart, tick.mid, tick.sequence);
                this.active.set(key, next);
                updates.push({ symbol: tick.symbol, timeframe, candle: { ...next } });
                continue;
            }
            if (bucketStart < current.time) {
                continue;
            }
            current.high = Math.max(current.high, tick.mid);
            current.low = Math.min(current.low, tick.mid);
            if (!delayedWithinTolerance) {
                current.close = tick.mid;
            }
            current.volume += 1;
            current.lastSequence = tick.sequence;
            updates.push({ symbol: tick.symbol, timeframe, candle: { ...current } });
        }
        return { updates, duplicate: false, outOfOrder: false, sequenceGap };
    }
    getCurrentCandle(symbol, timeframe) {
        const normalized = timeframe.toUpperCase();
        const candle = this.active.get(this.key(symbol, normalized));
        return candle ? { ...candle } : undefined;
    }
    getRecentCandles(symbol, timeframe, limit = 300) {
        const normalized = timeframe.toUpperCase();
        const key = this.key(symbol, normalized);
        const archived = this.history.get(key) ?? [];
        const active = this.active.get(key);
        const combined = active ? [...archived, active] : archived;
        return combined.slice(-Math.max(1, limit)).map((candle) => ({ ...candle }));
    }
    getLastSequence(symbol) {
        return this.lastSequence.get(symbol) ?? 0;
    }
    createCandle(timeframe, bucketStart, price, sequence) {
        const close = bucketStart + timeframe_config_1.TIMEFRAME_MS[timeframe];
        return {
            time: bucketStart,
            openTime: new Date(bucketStart).toISOString(),
            closeTime: new Date(close).toISOString(),
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 1,
            firstSequence: sequence,
            lastSequence: sequence,
            closed: false,
        };
    }
    archive(key, candle) {
        const candles = this.history.get(key) ?? [];
        candles.push(candle);
        if (candles.length > MAX_HISTORY_PER_STREAM) {
            candles.splice(0, candles.length - MAX_HISTORY_PER_STREAM);
        }
        this.history.set(key, candles);
    }
    key(symbol, timeframe) {
        return `${symbol}|${timeframe}`;
    }
};
exports.CandleAggregatorService = CandleAggregatorService;
exports.CandleAggregatorService = CandleAggregatorService = __decorate([
    (0, common_1.Injectable)()
], CandleAggregatorService);
//# sourceMappingURL=candle-aggregator.service.js.map