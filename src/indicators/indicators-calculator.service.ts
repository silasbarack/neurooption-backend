import { BadRequestException, Injectable } from '@nestjs/common';
import { CandleDto } from './dto/candle.dto';
import { IndicatorType } from './indicators.constants';

type Value = number | null;

@Injectable()
export class IndicatorsCalculatorService {
  calculate(
    indicator: IndicatorType,
    candles: CandleDto[],
    params: Record<string, number>,
  ) {
    if (!candles || candles.length < 2) {
      throw new BadRequestException('At least 2 candles are required.');
    }

    switch (indicator) {
      case IndicatorType.SMA:
        return this.line(candles, 'sma', this.sma(this.closes(candles), params.period));

      case IndicatorType.EMA:
        return this.line(candles, 'ema', this.ema(this.closes(candles), params.period));

      case IndicatorType.WMA:
        return this.line(candles, 'wma', this.wma(this.closes(candles), params.period));

      case IndicatorType.BOLLINGER_BANDS:
        return this.bollingerBands(candles, params.period, params.deviation);

      case IndicatorType.PARABOLIC_SAR:
        return this.parabolicSar(candles, params.step, params.max);

      case IndicatorType.ICHIMOKU:
        return this.ichimoku(
          candles,
          params.conversionPeriod,
          params.basePeriod,
          params.spanBPeriod,
          params.displacement,
        );

      case IndicatorType.DONCHIAN_CHANNEL:
        return this.donchianChannel(candles, params.period);

      case IndicatorType.ENVELOPES:
        return this.envelopes(candles, params.period, params.deviationPercent);

      case IndicatorType.AWESOME_OSCILLATOR:
        return this.awesomeOscillator(candles, params.fastPeriod, params.slowPeriod);

      case IndicatorType.RSI:
        return this.line(candles, 'rsi', this.rsi(this.closes(candles), params.period));

      case IndicatorType.MACD:
        return this.macd(candles, params.fastPeriod, params.slowPeriod, params.signalPeriod);

      case IndicatorType.CCI:
        return this.cci(candles, params.period);

      case IndicatorType.ADX:
        return this.adx(candles, params.period);

      case IndicatorType.ATR:
        return this.line(candles, 'atr', this.atr(candles, params.period));

      case IndicatorType.WILLIAMS_R:
        return this.williamsR(candles, params.period);

      case IndicatorType.MOMENTUM:
        return this.momentum(candles, params.period);

      case IndicatorType.STOCHASTIC_OSCILLATOR:
        return this.stochastic(candles, params.kPeriod, params.dPeriod, params.slowing);

      case IndicatorType.OSMA:
        return this.osma(candles, params.fastPeriod, params.slowPeriod, params.signalPeriod);

      case IndicatorType.ACCELERATOR_OSCILLATOR:
        return this.acceleratorOscillator(
          candles,
          params.fastPeriod,
          params.slowPeriod,
          params.signalPeriod,
        );

      case IndicatorType.BULLS_POWER:
        return this.bullsPower(candles, params.period);

      case IndicatorType.DEMARKER:
        return this.deMarker(candles, params.period);

      case IndicatorType.RATE_OF_CHANGE:
        return this.rateOfChange(candles, params.period);

      default:
        throw new BadRequestException('Unsupported indicator.');
    }
  }

  private closes(candles: CandleDto[]) {
    return candles.map((candle) => candle.close);
  }

  private round(value: Value): Value {
    if (value === null || !Number.isFinite(value)) return null;
    return Number(value.toFixed(6));
  }

  private line(candles: CandleDto[], key: string, values: Value[]) {
    return candles.map((candle, index) => ({
      time: candle.time,
      [key]: this.round(values[index]),
    }));
  }

  private highest(values: number[]) {
    return Math.max(...values);
  }

  private lowest(values: number[]) {
    return Math.min(...values);
  }

  private sma(values: number[], period: number): Value[] {
    return values.map((_, index) => {
      if (index < period - 1) return null;

      const slice = values.slice(index - period + 1, index + 1);

      return slice.reduce((sum, value) => sum + value, 0) / period;
    });
  }

  private smaNullable(values: Value[], period: number): Value[] {
    return values.map((_, index) => {
      if (index < period - 1) return null;

      const slice = values.slice(index - period + 1, index + 1);

      if (slice.some((value) => value === null || !Number.isFinite(value))) {
        return null;
      }

      return (slice as number[]).reduce((sum, value) => sum + value, 0) / period;
    });
  }

  private ema(values: number[], period: number): Value[] {
    const result: Value[] = Array(values.length).fill(null);

    if (values.length < period) return result;

    const multiplier = 2 / (period + 1);
    let previous = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;

    result[period - 1] = previous;

    for (let index = period; index < values.length; index += 1) {
      previous = values[index] * multiplier + previous * (1 - multiplier);
      result[index] = previous;
    }

    return result;
  }

  private emaNullable(values: Value[], period: number): Value[] {
    const result: Value[] = Array(values.length).fill(null);
    const multiplier = 2 / (period + 1);
    const seed: number[] = [];
    let previous: number | null = null;

    values.forEach((value, index) => {
      if (value === null || !Number.isFinite(value)) return;

      if (previous === null) {
        seed.push(value);

        if (seed.length === period) {
          previous = seed.reduce((sum, item) => sum + item, 0) / period;
          result[index] = previous;
        }

        return;
      }

      previous = value * multiplier + previous * (1 - multiplier);
      result[index] = previous;
    });

    return result;
  }

  private wma(values: number[], period: number): Value[] {
    const denominator = (period * (period + 1)) / 2;

    return values.map((_, index) => {
      if (index < period - 1) return null;

      let total = 0;

      for (let offset = 0; offset < period; offset += 1) {
        total += values[index - offset] * (period - offset);
      }

      return total / denominator;
    });
  }

  private standardDeviation(values: number[]) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;

    return Math.sqrt(variance);
  }

  private bollingerBands(candles: CandleDto[], period: number, deviation: number) {
    const closeValues = this.closes(candles);
    const middle = this.sma(closeValues, period);

    return candles.map((candle, index) => {
      if (index < period - 1 || middle[index] === null) {
        return { time: candle.time, upper: null, middle: null, lower: null };
      }

      const slice = closeValues.slice(index - period + 1, index + 1);
      const sd = this.standardDeviation(slice);

      return {
        time: candle.time,
        upper: this.round((middle[index] as number) + deviation * sd),
        middle: this.round(middle[index]),
        lower: this.round((middle[index] as number) - deviation * sd),
      };
    });
  }

  private trueRange(candles: CandleDto[], index: number) {
    if (index === 0) return candles[index].high - candles[index].low;

    return Math.max(
      candles[index].high - candles[index].low,
      Math.abs(candles[index].high - candles[index - 1].close),
      Math.abs(candles[index].low - candles[index - 1].close),
    );
  }

  private atr(candles: CandleDto[], period: number): Value[] {
    const result: Value[] = Array(candles.length).fill(null);

    if (candles.length <= period) return result;

    const ranges = candles.map((_, index) => this.trueRange(candles, index));
    let previousAtr =
      ranges.slice(1, period + 1).reduce((sum, value) => sum + value, 0) / period;

    result[period] = previousAtr;

    for (let index = period + 1; index < candles.length; index += 1) {
      previousAtr = (previousAtr * (period - 1) + ranges[index]) / period;
      result[index] = previousAtr;
    }

    return result;
  }

  private rsi(values: number[], period: number): Value[] {
    const result: Value[] = Array(values.length).fill(null);

    if (values.length <= period) return result;

    let gains = 0;
    let losses = 0;

    for (let index = 1; index <= period; index += 1) {
      const difference = values[index] - values[index - 1];

      if (difference >= 0) gains += difference;
      else losses += Math.abs(difference);
    }

    let averageGain = gains / period;
    let averageLoss = losses / period;

    result[period] =
      averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);

    for (let index = period + 1; index < values.length; index += 1) {
      const difference = values[index] - values[index - 1];
      const gain = difference > 0 ? difference : 0;
      const loss = difference < 0 ? Math.abs(difference) : 0;

      averageGain = (averageGain * (period - 1) + gain) / period;
      averageLoss = (averageLoss * (period - 1) + loss) / period;

      result[index] =
        averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);
    }

    return result;
  }

  private macd(
    candles: CandleDto[],
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
  ) {
    const closeValues = this.closes(candles);
    const fast = this.ema(closeValues, fastPeriod);
    const slow = this.ema(closeValues, slowPeriod);

    const macdLine = closeValues.map((_, index) => {
      if (fast[index] === null || slow[index] === null) return null;
      return (fast[index] as number) - (slow[index] as number);
    });

    const signalLine = this.emaNullable(macdLine, signalPeriod);

    return candles.map((candle, index) => ({
      time: candle.time,
      macd: this.round(macdLine[index]),
      signal: this.round(signalLine[index]),
      histogram:
        macdLine[index] === null || signalLine[index] === null
          ? null
          : this.round((macdLine[index] as number) - (signalLine[index] as number)),
    }));
  }

  private osma(
    candles: CandleDto[],
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
  ) {
    const macdValues = this.macd(candles, fastPeriod, slowPeriod, signalPeriod);

    return macdValues.map((point) => ({
      time: point.time,
      osma:
        point.macd === null || point.signal === null
          ? null
          : this.round((point.macd as number) - (point.signal as number)),
    }));
  }

  private cci(candles: CandleDto[], period: number) {
    const typicalPrices = candles.map(
      (candle) => (candle.high + candle.low + candle.close) / 3,
    );

    return candles.map((candle, index) => {
      if (index < period - 1) return { time: candle.time, cci: null };

      const slice = typicalPrices.slice(index - period + 1, index + 1);
      const mean = slice.reduce((sum, value) => sum + value, 0) / period;
      const meanDeviation =
        slice.reduce((sum, value) => sum + Math.abs(value - mean), 0) / period;

      if (meanDeviation === 0) return { time: candle.time, cci: null };

      return {
        time: candle.time,
        cci: this.round((typicalPrices[index] - mean) / (0.015 * meanDeviation)),
      };
    });
  }

  private adx(candles: CandleDto[], period: number) {
    const result = candles.map((candle) => ({
      time: candle.time,
      adx: null as Value,
      plusDi: null as Value,
      minusDi: null as Value,
    }));

    if (candles.length <= period * 2) return result;

    const tr: number[] = Array(candles.length).fill(0);
    const plusDm: number[] = Array(candles.length).fill(0);
    const minusDm: number[] = Array(candles.length).fill(0);
    const dx: Value[] = Array(candles.length).fill(null);

    for (let index = 1; index < candles.length; index += 1) {
      const upMove = candles[index].high - candles[index - 1].high;
      const downMove = candles[index - 1].low - candles[index].low;

      plusDm[index] = upMove > downMove && upMove > 0 ? upMove : 0;
      minusDm[index] = downMove > upMove && downMove > 0 ? downMove : 0;
      tr[index] = this.trueRange(candles, index);
    }

    let smoothedTr = tr.slice(1, period + 1).reduce((sum, value) => sum + value, 0);
    let smoothedPlusDm = plusDm.slice(1, period + 1).reduce((sum, value) => sum + value, 0);
    let smoothedMinusDm = minusDm.slice(1, period + 1).reduce((sum, value) => sum + value, 0);

    for (let index = period; index < candles.length; index += 1) {
      if (index > period) {
        smoothedTr = smoothedTr - smoothedTr / period + tr[index];
        smoothedPlusDm = smoothedPlusDm - smoothedPlusDm / period + plusDm[index];
        smoothedMinusDm = smoothedMinusDm - smoothedMinusDm / period + minusDm[index];
      }

      const plusDi = smoothedTr === 0 ? 0 : 100 * (smoothedPlusDm / smoothedTr);
      const minusDi = smoothedTr === 0 ? 0 : 100 * (smoothedMinusDm / smoothedTr);

      result[index].plusDi = this.round(plusDi);
      result[index].minusDi = this.round(minusDi);

      const denominator = plusDi + minusDi;
      dx[index] = denominator === 0 ? 0 : (100 * Math.abs(plusDi - minusDi)) / denominator;
    }

    const firstDx = dx.slice(period, period * 2).filter((value): value is number => value !== null);

    if (firstDx.length < period) return result;

    let previousAdx = firstDx.reduce((sum, value) => sum + value, 0) / period;

    result[period * 2 - 1].adx = this.round(previousAdx);

    for (let index = period * 2; index < candles.length; index += 1) {
      previousAdx = (previousAdx * (period - 1) + (dx[index] as number)) / period;
      result[index].adx = this.round(previousAdx);
    }

    return result;
  }

  private williamsR(candles: CandleDto[], period: number) {
    return candles.map((candle, index) => {
      if (index < period - 1) return { time: candle.time, williamsR: null };

      const slice = candles.slice(index - period + 1, index + 1);
      const high = this.highest(slice.map((item) => item.high));
      const low = this.lowest(slice.map((item) => item.low));

      if (high === low) return { time: candle.time, williamsR: null };

      return {
        time: candle.time,
        williamsR: this.round(((high - candle.close) / (high - low)) * -100),
      };
    });
  }

  private momentum(candles: CandleDto[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.time, momentum: null };

      const previousClose = candles[index - period].close;

      return {
        time: candle.time,
        momentum:
          previousClose === 0
            ? null
            : this.round((candle.close / previousClose) * 100),
      };
    });
  }

  private stochastic(candles: CandleDto[], kPeriod: number, dPeriod: number, slowing: number) {
    const rawK: Value[] = candles.map((candle, index) => {
      if (index < kPeriod - 1) return null;

      const slice = candles.slice(index - kPeriod + 1, index + 1);
      const high = this.highest(slice.map((item) => item.high));
      const low = this.lowest(slice.map((item) => item.low));

      if (high === low) return null;

      return ((candle.close - low) / (high - low)) * 100;
    });

    const slowK = this.smaNullable(rawK, slowing);
    const dLine = this.smaNullable(slowK, dPeriod);

    return candles.map((candle, index) => ({
      time: candle.time,
      k: this.round(slowK[index]),
      d: this.round(dLine[index]),
    }));
  }

  private awesomeOscillator(candles: CandleDto[], fastPeriod: number, slowPeriod: number) {
    const median = candles.map((candle) => (candle.high + candle.low) / 2);
    const fast = this.sma(median, fastPeriod);
    const slow = this.sma(median, slowPeriod);

    return candles.map((candle, index) => ({
      time: candle.time,
      ao:
        fast[index] === null || slow[index] === null
          ? null
          : this.round((fast[index] as number) - (slow[index] as number)),
    }));
  }

  private acceleratorOscillator(
    candles: CandleDto[],
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
  ) {
    const ao = this.awesomeOscillator(candles, fastPeriod, slowPeriod).map(
      (point) => point.ao as Value,
    );

    const signal = this.smaNullable(ao, signalPeriod);

    return candles.map((candle, index) => ({
      time: candle.time,
      ac:
        ao[index] === null || signal[index] === null
          ? null
          : this.round((ao[index] as number) - (signal[index] as number)),
    }));
  }

  private bullsPower(candles: CandleDto[], period: number) {
    const closeEma = this.ema(this.closes(candles), period);

    return candles.map((candle, index) => ({
      time: candle.time,
      bullsPower:
        closeEma[index] === null
          ? null
          : this.round(candle.high - (closeEma[index] as number)),
    }));
  }

  private deMarker(candles: CandleDto[], period: number) {
    const deMax: number[] = Array(candles.length).fill(0);
    const deMin: number[] = Array(candles.length).fill(0);

    for (let index = 1; index < candles.length; index += 1) {
      deMax[index] =
        candles[index].high > candles[index - 1].high
          ? candles[index].high - candles[index - 1].high
          : 0;

      deMin[index] =
        candles[index].low < candles[index - 1].low
          ? candles[index - 1].low - candles[index].low
          : 0;
    }

    const deMaxSma = this.sma(deMax, period);
    const deMinSma = this.sma(deMin, period);

    return candles.map((candle, index) => {
      if (deMaxSma[index] === null || deMinSma[index] === null) {
        return { time: candle.time, deMarker: null };
      }

      const denominator = (deMaxSma[index] as number) + (deMinSma[index] as number);

      return {
        time: candle.time,
        deMarker:
          denominator === 0
            ? null
            : this.round((deMaxSma[index] as number) / denominator),
      };
    });
  }

  private rateOfChange(candles: CandleDto[], period: number) {
    return candles.map((candle, index) => {
      if (index < period) return { time: candle.time, roc: null };

      const previousClose = candles[index - period].close;

      return {
        time: candle.time,
        roc:
          previousClose === 0
            ? null
            : this.round(((candle.close - previousClose) / previousClose) * 100),
      };
    });
  }

  private parabolicSar(candles: CandleDto[], step: number, max: number) {
    const result = candles.map((candle) => ({
      time: candle.time,
      psar: null as Value,
      trend: null as 'UP' | 'DOWN' | null,
    }));

    if (candles.length < 2) return result;

    let upTrend = candles[1].close >= candles[0].close;
    let acceleration = step;
    let extremePoint = upTrend ? candles[1].high : candles[1].low;
    let sar = upTrend ? candles[0].low : candles[0].high;

    result[1].psar = this.round(sar);
    result[1].trend = upTrend ? 'UP' : 'DOWN';

    for (let index = 2; index < candles.length; index += 1) {
      sar = sar + acceleration * (extremePoint - sar);

      if (upTrend) {
        sar = Math.min(sar, candles[index - 1].low, candles[index - 2].low);

        if (candles[index].low < sar) {
          upTrend = false;
          sar = extremePoint;
          extremePoint = candles[index].low;
          acceleration = step;
        } else if (candles[index].high > extremePoint) {
          extremePoint = candles[index].high;
          acceleration = Math.min(acceleration + step, max);
        }
      } else {
        sar = Math.max(sar, candles[index - 1].high, candles[index - 2].high);

        if (candles[index].high > sar) {
          upTrend = true;
          sar = extremePoint;
          extremePoint = candles[index].high;
          acceleration = step;
        } else if (candles[index].low < extremePoint) {
          extremePoint = candles[index].low;
          acceleration = Math.min(acceleration + step, max);
        }
      }

      result[index].psar = this.round(sar);
      result[index].trend = upTrend ? 'UP' : 'DOWN';
    }

    return result;
  }

  private ichimoku(
    candles: CandleDto[],
    conversionPeriod: number,
    basePeriod: number,
    spanBPeriod: number,
    displacement: number,
  ) {
    return candles.map((candle, index) => {
      const conversion =
        index < conversionPeriod - 1
          ? null
          : (this.highest(
              candles.slice(index - conversionPeriod + 1, index + 1).map((item) => item.high),
            ) +
              this.lowest(
                candles.slice(index - conversionPeriod + 1, index + 1).map((item) => item.low),
              )) /
            2;

      const base =
        index < basePeriod - 1
          ? null
          : (this.highest(
              candles.slice(index - basePeriod + 1, index + 1).map((item) => item.high),
            ) +
              this.lowest(
                candles.slice(index - basePeriod + 1, index + 1).map((item) => item.low),
              )) /
            2;

      const spanB =
        index < spanBPeriod - 1
          ? null
          : (this.highest(
              candles.slice(index - spanBPeriod + 1, index + 1).map((item) => item.high),
            ) +
              this.lowest(
                candles.slice(index - spanBPeriod + 1, index + 1).map((item) => item.low),
              )) /
            2;

      return {
        time: candle.time,
        tenkanSen: this.round(conversion),
        kijunSen: this.round(base),
        senkouSpanA:
          conversion === null || base === null
            ? null
            : this.round((conversion + base) / 2),
        senkouSpanB: this.round(spanB),
        chikouSpan:
          index - displacement >= 0
            ? this.round(candles[index - displacement].close)
            : null,
        displacement,
      };
    });
  }

  private donchianChannel(candles: CandleDto[], period: number) {
    return candles.map((candle, index) => {
      if (index < period - 1) {
        return { time: candle.time, upper: null, middle: null, lower: null };
      }

      const slice = candles.slice(index - period + 1, index + 1);
      const upper = this.highest(slice.map((item) => item.high));
      const lower = this.lowest(slice.map((item) => item.low));

      return {
        time: candle.time,
        upper: this.round(upper),
        middle: this.round((upper + lower) / 2),
        lower: this.round(lower),
      };
    });
  }

  private envelopes(candles: CandleDto[], period: number, deviationPercent: number) {
    const closeValues = this.closes(candles);
    const middle = this.sma(closeValues, period);
    const deviation = deviationPercent / 100;

    return candles.map((candle, index) => {
      if (middle[index] === null) {
        return { time: candle.time, upper: null, middle: null, lower: null };
      }

      return {
        time: candle.time,
        upper: this.round((middle[index] as number) * (1 + deviation)),
        middle: this.round(middle[index]),
        lower: this.round((middle[index] as number) * (1 - deviation)),
      };
    });
  }
}