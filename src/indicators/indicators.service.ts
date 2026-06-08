import { BadRequestException, Injectable } from '@nestjs/common';
import { CandlesService } from '../candles/candles.service';
import { CandleType } from '../candles/dto/create-candle.dto';
import { IndicatorQueryDto, IndicatorType } from './dto/indicator-query.dto';

@Injectable()
export class IndicatorsService {
  constructor(private readonly candlesService: CandlesService) {}

  calculate(query: IndicatorQueryDto) {
    const candles = this.candlesService.findByQuery({
      symbol: query.symbol,
      timeframe: query.timeframe,
      type: CandleType.CANDLESTICK,
    });

    if (!candles.length) {
      throw new BadRequestException('No candle data found for this symbol and timeframe');
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
    return Object.values(IndicatorType).map((indicator) => ({
      name: indicator,
      category: this.getCategory(indicator),
    }));
  }

  private calculateIndicator(indicator: IndicatorType, candles: any[], period: number) {
    switch (indicator) {
      case IndicatorType.SMA:
        return this.sma(candles, period);

      case IndicatorType.EMA:
        return this.ema(candles, period);

      case IndicatorType.WMA:
        return this.wma(candles, period);

      case IndicatorType.RSI:
        return this.rsi(candles, period);

      case IndicatorType.MACD:
        return this.macd(candles);

      case IndicatorType.BOLLINGER_BANDS:
        return this.bollingerBands(candles, period);

      case IndicatorType.STOCHASTIC:
        return this.stochastic(candles, period);

      case IndicatorType.ATR:
        return this.atr(candles, period);

      case IndicatorType.CCI:
        return this.cci(candles, period);

      case IndicatorType.MOMENTUM:
        return this.momentum(candles, period);

      case IndicatorType.ROC:
        return this.roc(candles, period);

      case IndicatorType.WILLIAMS_R:
        return this.williamsR(candles, period);

      case IndicatorType.VWAP:
        return this.vwap(candles);

      case IndicatorType.OBV:
        return this.obv(candles);

      case IndicatorType.MFI:
        return this.mfi(candles, period);

      case IndicatorType.STANDARD_DEVIATION:
        return this.standardDeviation(candles, period);

      case IndicatorType.DONCHIAN_CHANNEL:
        return this.donchianChannel(candles, period);

      case IndicatorType.PIVOT_POINTS:
        return this.pivotPoints(candles);

      case IndicatorType.ADX:
      case IndicatorType.PARABOLIC_SAR:
      case IndicatorType.ICHIMOKU:
      case IndicatorType.SUPERTREND:
      case IndicatorType.KELTNER_CHANNEL:
      case IndicatorType.ZIGZAG:
      case IndicatorType.DEMA:
      case IndicatorType.TEMA:
      case IndicatorType.TRIX:
      case IndicatorType.AROON:
      case IndicatorType.CHAIKIN_OSCILLATOR:
      case IndicatorType.VOLUME_OSCILLATOR:
      case IndicatorType.ALLIGATOR:
      case IndicatorType.FRACTALS:
      case IndicatorType.AWESOME_OSCILLATOR:
      case IndicatorType.ACCELERATOR_OSCILLATOR:
      case IndicatorType.ENVELOPES:
      case IndicatorType.GATOR_OSCILLATOR:
      case IndicatorType.DEMARKER:
      case IndicatorType.RVI:
      case IndicatorType.ELDER_RAY:
      case IndicatorType.FORCE_INDEX:
      case IndicatorType.BULLS_POWER:
      case IndicatorType.BEARS_POWER:
        return this.placeholder(indicator, candles);

      default:
        throw new BadRequestException('Unsupported indicator');
    }
  }

  private sma(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = candles.slice(index + 1 - period, index + 1);
      const sum = slice.reduce((total, item) => total + item.close, 0);

      return {
        time: candle.closedAt,
        value: Number((sum / period).toFixed(6)),
      };
    });
  }

  private ema(candles: any[], period: number) {
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

  private wma(candles: any[], period: number) {
    const denominator = (period * (period + 1)) / 2;

    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = candles.slice(index + 1 - period, index + 1);
      const weightedSum = slice.reduce(
        (total, item, i) => total + item.close * (i + 1),
        0,
      );

      return {
        time: candle.closedAt,
        value: Number((weightedSum / denominator).toFixed(6)),
      };
    });
  }

  private rsi(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.closedAt, value: null };

      let gains = 0;
      let losses = 0;

      for (let i = index - period + 1; i <= index; i++) {
        const change = candles[i].close - candles[i - 1].close;

        if (change >= 0) gains += change;
        else losses += Math.abs(change);
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

  private macd(candles: any[]) {
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

  private bollingerBands(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) {
        return { time: candle.closedAt, upper: null, middle: null, lower: null };
      }

      const slice = candles.slice(index + 1 - period, index + 1);
      const closes = slice.map((item) => item.close);
      const mean = closes.reduce((a, b) => a + b, 0) / period;

      const variance =
        closes.reduce((total, close) => total + Math.pow(close - mean, 2), 0) /
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

  private stochastic(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, k: null, d: null };

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

  private atr(candles: any[], period: number) {
    const trueRanges = candles.map((candle, index) => {
      if (index === 0) return candle.high - candle.low;

      const previousClose = candles[index - 1].close;

      return Math.max(
        candle.high - candle.low,
        Math.abs(candle.high - previousClose),
        Math.abs(candle.low - previousClose),
      );
    });

    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = trueRanges.slice(index + 1 - period, index + 1);
      const atr = slice.reduce((a, b) => a + b, 0) / period;

      return {
        time: candle.closedAt,
        value: Number(atr.toFixed(6)),
      };
    });
  }

  private cci(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = candles.slice(index + 1 - period, index + 1);
      const typicalPrices = slice.map(
        (item) => (item.high + item.low + item.close) / 3,
      );

      const sma =
        typicalPrices.reduce((total, price) => total + price, 0) / period;

      const meanDeviation =
        typicalPrices.reduce((total, price) => total + Math.abs(price - sma), 0) /
        period;

      const currentTypicalPrice = (candle.high + candle.low + candle.close) / 3;
      const cci = (currentTypicalPrice - sma) / (0.015 * meanDeviation);

      return {
        time: candle.closedAt,
        value: Number(cci.toFixed(2)),
      };
    });
  }

  private momentum(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.closedAt, value: null };

      return {
        time: candle.closedAt,
        value: Number((candle.close - candles[index - period].close).toFixed(6)),
      };
    });
  }

  private roc(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.closedAt, value: null };

      const previous = candles[index - period].close;
      const value = ((candle.close - previous) / previous) * 100;

      return {
        time: candle.closedAt,
        value: Number(value.toFixed(2)),
      };
    });
  }

  private williamsR(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = candles.slice(index + 1 - period, index + 1);
      const highestHigh = Math.max(...slice.map((item) => item.high));
      const lowestLow = Math.min(...slice.map((item) => item.low));

      const value =
        ((highestHigh - candle.close) / (highestHigh - lowestLow)) * -100;

      return {
        time: candle.closedAt,
        value: Number(value.toFixed(2)),
      };
    });
  }

  private vwap(candles: any[]) {
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

  private obv(candles: any[]) {
    let obv = 0;

    return candles.map((candle, index) => {
      if (index === 0) return { time: candle.closedAt, value: obv };

      if (candle.close > candles[index - 1].close) obv += candle.volume;
      else if (candle.close < candles[index - 1].close) obv -= candle.volume;

      return {
        time: candle.closedAt,
        value: obv,
      };
    });
  }

  private mfi(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.closedAt, value: null };

      let positiveFlow = 0;
      let negativeFlow = 0;

      for (let i = index - period + 1; i <= index; i++) {
        const typical = (candles[i].high + candles[i].low + candles[i].close) / 3;
        const previousTypical =
          (candles[i - 1].high + candles[i - 1].low + candles[i - 1].close) / 3;

        const moneyFlow = typical * candles[i].volume;

        if (typical > previousTypical) positiveFlow += moneyFlow;
        else negativeFlow += moneyFlow;
      }

      const moneyRatio = positiveFlow / negativeFlow;
      const value = 100 - 100 / (1 + moneyRatio);

      return {
        time: candle.closedAt,
        value: Number(value.toFixed(2)),
      };
    });
  }

  private standardDeviation(candles: any[], period: number) {
    return candles.map((candle, index) => {
      if (index + 1 < period) return { time: candle.closedAt, value: null };

      const slice = candles.slice(index + 1 - period, index + 1);
      const closes = slice.map((item) => item.close);
      const mean = closes.reduce((a, b) => a + b, 0) / period;

      const variance =
        closes.reduce((total, close) => total + Math.pow(close - mean, 2), 0) /
        period;

      return {
        time: candle.closedAt,
        value: Number(Math.sqrt(variance).toFixed(6)),
      };
    });
  }

  private donchianChannel(candles: any[], period: number) {
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

  private pivotPoints(candles: any[]) {
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

  private placeholder(indicator: IndicatorType, candles: any[]) {
    return candles.map((candle) => ({
      time: candle.closedAt,
      indicator,
      value: null,
      message: 'Formula placeholder. Add exact calculation before production.',
    }));
  }

  private getCategory(indicator: IndicatorType) {
    const trend = [
      IndicatorType.SMA,
      IndicatorType.EMA,
      IndicatorType.WMA,
      IndicatorType.MACD,
      IndicatorType.PARABOLIC_SAR,
      IndicatorType.ICHIMOKU,
      IndicatorType.SUPERTREND,
      IndicatorType.ALLIGATOR,
      IndicatorType.ENVELOPES,
    ];

    const oscillator = [
      IndicatorType.RSI,
      IndicatorType.STOCHASTIC,
      IndicatorType.CCI,
      IndicatorType.MOMENTUM,
      IndicatorType.ROC,
      IndicatorType.WILLIAMS_R,
      IndicatorType.TRIX,
      IndicatorType.AROON,
      IndicatorType.AWESOME_OSCILLATOR,
      IndicatorType.ACCELERATOR_OSCILLATOR,
      IndicatorType.GATOR_OSCILLATOR,
      IndicatorType.DEMARKER,
      IndicatorType.RVI,
    ];

    const volume = [
      IndicatorType.VWAP,
      IndicatorType.OBV,
      IndicatorType.MFI,
      IndicatorType.CHAIKIN_OSCILLATOR,
      IndicatorType.VOLUME_OSCILLATOR,
      IndicatorType.FORCE_INDEX,
    ];

    const volatility = [
      IndicatorType.ATR,
      IndicatorType.BOLLINGER_BANDS,
      IndicatorType.DONCHIAN_CHANNEL,
      IndicatorType.KELTNER_CHANNEL,
      IndicatorType.STANDARD_DEVIATION,
    ];

    if (trend.includes(indicator)) return 'TREND';
    if (oscillator.includes(indicator)) return 'OSCILLATOR';
    if (volume.includes(indicator)) return 'VOLUME';
    if (volatility.includes(indicator)) return 'VOLATILITY';

    return 'OTHER';
  }
}