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
exports.IndicatorsService = void 0;
const common_1 = require("@nestjs/common");
const candles_service_1 = require("../candles/candles.service");
const create_candle_dto_1 = require("../candles/dto/create-candle.dto");
const indicator_query_dto_1 = require("./dto/indicator-query.dto");
let IndicatorsService = class IndicatorsService {
    constructor(candlesService) {
        this.candlesService = candlesService;
    }
    calculate(query) {
        const candles = this.candlesService.findByQuery({
            symbol: query.symbol,
            timeframe: query.timeframe,
            type: create_candle_dto_1.CandleType.CANDLESTICK,
        });
        if (!candles.length) {
            throw new common_1.BadRequestException('No candle data found for this symbol and timeframe');
        }
        const period = query.period ?? 14;
        const values = this.calculateIndicator(query.indicator, candles, period);
        return {
            symbol: query.symbol,
            timeframe: query.timeframe,
            indicator: query.indicator,
            values,
            generatedAt: new Date(),
        };
    }
    listIndicators() {
        return Object.values(indicator_query_dto_1.IndicatorType).map((indicator) => ({
            name: indicator,
            category: this.getCategory(indicator),
        }));
    }
    calculateIndicator(indicator, candles, period) {
        switch (indicator) {
            case indicator_query_dto_1.IndicatorType.SMA:
                return this.sma(candles, period);
            case indicator_query_dto_1.IndicatorType.EMA:
                return this.ema(candles, period);
            case indicator_query_dto_1.IndicatorType.WMA:
                return this.wma(candles, period);
            case indicator_query_dto_1.IndicatorType.RSI:
                return this.rsi(candles, period);
            case indicator_query_dto_1.IndicatorType.MACD:
                return this.macd(candles);
            case indicator_query_dto_1.IndicatorType.BOLLINGER_BANDS:
                return this.bollingerBands(candles, period);
            case indicator_query_dto_1.IndicatorType.STOCHASTIC:
                return this.stochastic(candles, period);
            case indicator_query_dto_1.IndicatorType.ATR:
                return this.atr(candles, period);
            case indicator_query_dto_1.IndicatorType.CCI:
                return this.cci(candles, period);
            case indicator_query_dto_1.IndicatorType.MOMENTUM:
                return this.momentum(candles, period);
            case indicator_query_dto_1.IndicatorType.ROC:
                return this.roc(candles, period);
            case indicator_query_dto_1.IndicatorType.WILLIAMS_R:
                return this.williamsR(candles, period);
            case indicator_query_dto_1.IndicatorType.VWAP:
                return this.vwap(candles);
            case indicator_query_dto_1.IndicatorType.OBV:
                return this.obv(candles);
            case indicator_query_dto_1.IndicatorType.MFI:
                return this.mfi(candles, period);
            case indicator_query_dto_1.IndicatorType.STANDARD_DEVIATION:
                return this.standardDeviation(candles, period);
            case indicator_query_dto_1.IndicatorType.DONCHIAN_CHANNEL:
                return this.donchianChannel(candles, period);
            case indicator_query_dto_1.IndicatorType.PIVOT_POINTS:
                return this.pivotPoints(candles);
            case indicator_query_dto_1.IndicatorType.ADX:
            case indicator_query_dto_1.IndicatorType.PARABOLIC_SAR:
            case indicator_query_dto_1.IndicatorType.ICHIMOKU:
            case indicator_query_dto_1.IndicatorType.SUPERTREND:
            case indicator_query_dto_1.IndicatorType.KELTNER_CHANNEL:
            case indicator_query_dto_1.IndicatorType.ZIGZAG:
            case indicator_query_dto_1.IndicatorType.DEMA:
            case indicator_query_dto_1.IndicatorType.TEMA:
            case indicator_query_dto_1.IndicatorType.TRIX:
            case indicator_query_dto_1.IndicatorType.AROON:
            case indicator_query_dto_1.IndicatorType.CHAIKIN_OSCILLATOR:
            case indicator_query_dto_1.IndicatorType.VOLUME_OSCILLATOR:
            case indicator_query_dto_1.IndicatorType.ALLIGATOR:
            case indicator_query_dto_1.IndicatorType.FRACTALS:
            case indicator_query_dto_1.IndicatorType.AWESOME_OSCILLATOR:
            case indicator_query_dto_1.IndicatorType.ACCELERATOR_OSCILLATOR:
            case indicator_query_dto_1.IndicatorType.ENVELOPES:
            case indicator_query_dto_1.IndicatorType.GATOR_OSCILLATOR:
            case indicator_query_dto_1.IndicatorType.DEMARKER:
            case indicator_query_dto_1.IndicatorType.RVI:
            case indicator_query_dto_1.IndicatorType.ELDER_RAY:
            case indicator_query_dto_1.IndicatorType.FORCE_INDEX:
            case indicator_query_dto_1.IndicatorType.BULLS_POWER:
            case indicator_query_dto_1.IndicatorType.BEARS_POWER:
                return this.placeholder(indicator, candles);
            default:
                throw new common_1.BadRequestException('Unsupported indicator');
        }
    }
    sma(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const sum = slice.reduce((total, item) => total + item.close, 0);
            return {
                time: candle.closedAt,
                value: Number((sum / period).toFixed(6)),
            };
        });
    }
    ema(candles, period) {
        const multiplier = 2 / (period + 1);
        let previousEma = candles[0].close;
        return candles.map((candle, index) => {
            if (index === 0) {
                return { time: candle.closedAt, value: Number(previousEma.toFixed(6)) };
            }
            previousEma = (candle.close - previousEma) * multiplier + previousEma;
            return {
                time: candle.closedAt,
                value: Number(previousEma.toFixed(6)),
            };
        });
    }
    wma(candles, period) {
        const denominator = (period * (period + 1)) / 2;
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const weightedSum = slice.reduce((total, item, i) => total + item.close * (i + 1), 0);
            return {
                time: candle.closedAt,
                value: Number((weightedSum / denominator).toFixed(6)),
            };
        });
    }
    rsi(candles, period) {
        return candles.map((candle, index) => {
            if (index < period)
                return { time: candle.closedAt, value: null };
            let gains = 0;
            let losses = 0;
            for (let i = index - period + 1; i <= index; i++) {
                const change = candles[i].close - candles[i - 1].close;
                if (change >= 0)
                    gains += change;
                else
                    losses += Math.abs(change);
            }
            const averageGain = gains / period;
            const averageLoss = losses / period;
            if (averageLoss === 0) {
                return { time: candle.closedAt, value: 100 };
            }
            const rs = averageGain / averageLoss;
            const value = 100 - 100 / (1 + rs);
            return {
                time: candle.closedAt,
                value: Number(value.toFixed(2)),
            };
        });
    }
    macd(candles) {
        const ema12 = this.ema(candles, 12);
        const ema26 = this.ema(candles, 26);
        const macdLine = candles.map((candle, index) => {
            const fast = ema12[index].value;
            const slow = ema26[index].value;
            return {
                time: candle.closedAt,
                macd: Number((fast - slow).toFixed(6)),
            };
        });
        const signalInput = macdLine.map((item) => ({
            close: item.macd,
            closedAt: item.time,
        }));
        const signal = this.ema(signalInput, 9);
        return macdLine.map((item, index) => ({
            time: item.time,
            macd: item.macd,
            signal: signal[index].value,
            histogram: Number((item.macd - signal[index].value).toFixed(6)),
        }));
    }
    bollingerBands(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period) {
                return { time: candle.closedAt, upper: null, middle: null, lower: null };
            }
            const slice = candles.slice(index + 1 - period, index + 1);
            const closes = slice.map((item) => item.close);
            const mean = closes.reduce((a, b) => a + b, 0) / period;
            const variance = closes.reduce((total, close) => total + Math.pow(close - mean, 2), 0) /
                period;
            const deviation = Math.sqrt(variance);
            return {
                time: candle.closedAt,
                upper: Number((mean + deviation * 2).toFixed(6)),
                middle: Number(mean.toFixed(6)),
                lower: Number((mean - deviation * 2).toFixed(6)),
            };
        });
    }
    stochastic(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, k: null, d: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const highestHigh = Math.max(...slice.map((item) => item.high));
            const lowestLow = Math.min(...slice.map((item) => item.low));
            const k = ((candle.close - lowestLow) / (highestHigh - lowestLow)) * 100;
            return {
                time: candle.closedAt,
                k: Number(k.toFixed(2)),
                d: null,
            };
        });
    }
    atr(candles, period) {
        const trueRanges = candles.map((candle, index) => {
            if (index === 0)
                return candle.high - candle.low;
            const previousClose = candles[index - 1].close;
            return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
        });
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = trueRanges.slice(index + 1 - period, index + 1);
            const atr = slice.reduce((a, b) => a + b, 0) / period;
            return {
                time: candle.closedAt,
                value: Number(atr.toFixed(6)),
            };
        });
    }
    cci(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const typicalPrices = slice.map((item) => (item.high + item.low + item.close) / 3);
            const sma = typicalPrices.reduce((total, price) => total + price, 0) / period;
            const meanDeviation = typicalPrices.reduce((total, price) => total + Math.abs(price - sma), 0) /
                period;
            const currentTypicalPrice = (candle.high + candle.low + candle.close) / 3;
            const cci = (currentTypicalPrice - sma) / (0.015 * meanDeviation);
            return {
                time: candle.closedAt,
                value: Number(cci.toFixed(2)),
            };
        });
    }
    momentum(candles, period) {
        return candles.map((candle, index) => {
            if (index < period)
                return { time: candle.closedAt, value: null };
            return {
                time: candle.closedAt,
                value: Number((candle.close - candles[index - period].close).toFixed(6)),
            };
        });
    }
    roc(candles, period) {
        return candles.map((candle, index) => {
            if (index < period)
                return { time: candle.closedAt, value: null };
            const previous = candles[index - period].close;
            const value = ((candle.close - previous) / previous) * 100;
            return {
                time: candle.closedAt,
                value: Number(value.toFixed(2)),
            };
        });
    }
    williamsR(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const highestHigh = Math.max(...slice.map((item) => item.high));
            const lowestLow = Math.min(...slice.map((item) => item.low));
            const value = ((highestHigh - candle.close) / (highestHigh - lowestLow)) * -100;
            return {
                time: candle.closedAt,
                value: Number(value.toFixed(2)),
            };
        });
    }
    vwap(candles) {
        let cumulativePriceVolume = 0;
        let cumulativeVolume = 0;
        return candles.map((candle) => {
            const typicalPrice = (candle.high + candle.low + candle.close) / 3;
            cumulativePriceVolume += typicalPrice * candle.volume;
            cumulativeVolume += candle.volume;
            return {
                time: candle.closedAt,
                value: Number((cumulativePriceVolume / cumulativeVolume).toFixed(6)),
            };
        });
    }
    obv(candles) {
        let obv = 0;
        return candles.map((candle, index) => {
            if (index === 0)
                return { time: candle.closedAt, value: obv };
            if (candle.close > candles[index - 1].close)
                obv += candle.volume;
            else if (candle.close < candles[index - 1].close)
                obv -= candle.volume;
            return {
                time: candle.closedAt,
                value: obv,
            };
        });
    }
    mfi(candles, period) {
        return candles.map((candle, index) => {
            if (index < period)
                return { time: candle.closedAt, value: null };
            let positiveFlow = 0;
            let negativeFlow = 0;
            for (let i = index - period + 1; i <= index; i++) {
                const typical = (candles[i].high + candles[i].low + candles[i].close) / 3;
                const previousTypical = (candles[i - 1].high + candles[i - 1].low + candles[i - 1].close) / 3;
                const moneyFlow = typical * candles[i].volume;
                if (typical > previousTypical)
                    positiveFlow += moneyFlow;
                else
                    negativeFlow += moneyFlow;
            }
            const moneyRatio = positiveFlow / negativeFlow;
            const value = 100 - 100 / (1 + moneyRatio);
            return {
                time: candle.closedAt,
                value: Number(value.toFixed(2)),
            };
        });
    }
    standardDeviation(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period)
                return { time: candle.closedAt, value: null };
            const slice = candles.slice(index + 1 - period, index + 1);
            const closes = slice.map((item) => item.close);
            const mean = closes.reduce((a, b) => a + b, 0) / period;
            const variance = closes.reduce((total, close) => total + Math.pow(close - mean, 2), 0) /
                period;
            return {
                time: candle.closedAt,
                value: Number(Math.sqrt(variance).toFixed(6)),
            };
        });
    }
    donchianChannel(candles, period) {
        return candles.map((candle, index) => {
            if (index + 1 < period) {
                return { time: candle.closedAt, upper: null, middle: null, lower: null };
            }
            const slice = candles.slice(index + 1 - period, index + 1);
            const upper = Math.max(...slice.map((item) => item.high));
            const lower = Math.min(...slice.map((item) => item.low));
            return {
                time: candle.closedAt,
                upper,
                middle: Number(((upper + lower) / 2).toFixed(6)),
                lower,
            };
        });
    }
    pivotPoints(candles) {
        return candles.map((candle) => {
            const pivot = (candle.high + candle.low + candle.close) / 3;
            return {
                time: candle.closedAt,
                pivot: Number(pivot.toFixed(6)),
                resistance1: Number((2 * pivot - candle.low).toFixed(6)),
                support1: Number((2 * pivot - candle.high).toFixed(6)),
                resistance2: Number((pivot + candle.high - candle.low).toFixed(6)),
                support2: Number((pivot - candle.high + candle.low).toFixed(6)),
            };
        });
    }
    placeholder(indicator, candles) {
        return candles.map((candle) => ({
            time: candle.closedAt,
            indicator,
            value: null,
            message: 'Formula placeholder. Add exact calculation before production.',
        }));
    }
    getCategory(indicator) {
        const trend = [
            indicator_query_dto_1.IndicatorType.SMA,
            indicator_query_dto_1.IndicatorType.EMA,
            indicator_query_dto_1.IndicatorType.WMA,
            indicator_query_dto_1.IndicatorType.MACD,
            indicator_query_dto_1.IndicatorType.PARABOLIC_SAR,
            indicator_query_dto_1.IndicatorType.ICHIMOKU,
            indicator_query_dto_1.IndicatorType.SUPERTREND,
            indicator_query_dto_1.IndicatorType.ALLIGATOR,
            indicator_query_dto_1.IndicatorType.ENVELOPES,
        ];
        const oscillator = [
            indicator_query_dto_1.IndicatorType.RSI,
            indicator_query_dto_1.IndicatorType.STOCHASTIC,
            indicator_query_dto_1.IndicatorType.CCI,
            indicator_query_dto_1.IndicatorType.MOMENTUM,
            indicator_query_dto_1.IndicatorType.ROC,
            indicator_query_dto_1.IndicatorType.WILLIAMS_R,
            indicator_query_dto_1.IndicatorType.TRIX,
            indicator_query_dto_1.IndicatorType.AROON,
            indicator_query_dto_1.IndicatorType.AWESOME_OSCILLATOR,
            indicator_query_dto_1.IndicatorType.ACCELERATOR_OSCILLATOR,
            indicator_query_dto_1.IndicatorType.GATOR_OSCILLATOR,
            indicator_query_dto_1.IndicatorType.DEMARKER,
            indicator_query_dto_1.IndicatorType.RVI,
        ];
        const volume = [
            indicator_query_dto_1.IndicatorType.VWAP,
            indicator_query_dto_1.IndicatorType.OBV,
            indicator_query_dto_1.IndicatorType.MFI,
            indicator_query_dto_1.IndicatorType.CHAIKIN_OSCILLATOR,
            indicator_query_dto_1.IndicatorType.VOLUME_OSCILLATOR,
            indicator_query_dto_1.IndicatorType.FORCE_INDEX,
        ];
        const volatility = [
            indicator_query_dto_1.IndicatorType.ATR,
            indicator_query_dto_1.IndicatorType.BOLLINGER_BANDS,
            indicator_query_dto_1.IndicatorType.DONCHIAN_CHANNEL,
            indicator_query_dto_1.IndicatorType.KELTNER_CHANNEL,
            indicator_query_dto_1.IndicatorType.STANDARD_DEVIATION,
        ];
        if (trend.includes(indicator))
            return 'TREND';
        if (oscillator.includes(indicator))
            return 'OSCILLATOR';
        if (volume.includes(indicator))
            return 'VOLUME';
        if (volatility.includes(indicator))
            return 'VOLATILITY';
        return 'OTHER';
    }
};
exports.IndicatorsService = IndicatorsService;
exports.IndicatorsService = IndicatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [candles_service_1.CandlesService])
], IndicatorsService);
//# sourceMappingURL=indicators.service.js.map