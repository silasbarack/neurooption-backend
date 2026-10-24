import { CandleDto } from './dto/candle.dto';
import { IndicatorType } from './indicators.constants';
type Value = number | null;
export declare class IndicatorsCalculatorService {
    calculate(indicator: IndicatorType, candles: CandleDto[], params: Record<string, number>): {
        [x: string]: number;
        time: number;
    }[] | {
        time: number;
        upper: number;
        middle: number;
        lower: number;
    }[] | {
        time: number;
        psar: Value;
        trend: "UP" | "DOWN" | null;
    }[] | {
        time: number;
        tenkanSen: number;
        kijunSen: number;
        senkouSpanA: number;
        senkouSpanB: number;
        chikouSpan: number;
        displacement: number;
    }[] | {
        time: number;
        ao: number;
    }[] | {
        time: number;
        macd: number;
        signal: number;
        histogram: number;
    }[] | {
        time: number;
        cci: number;
    }[] | {
        time: number;
        adx: Value;
        plusDi: Value;
        minusDi: Value;
    }[] | {
        time: number;
        williamsR: number;
    }[] | {
        time: number;
        momentum: number;
    }[] | {
        time: number;
        k: number;
        d: number;
    }[] | {
        time: number;
        osma: number;
    }[] | {
        time: number;
        ac: number;
    }[] | {
        time: number;
        bullsPower: number;
    }[] | {
        time: number;
        deMarker: number;
    }[] | {
        time: number;
        roc: number;
    }[];
    private closes;
    private round;
    private line;
    private highest;
    private lowest;
    private sma;
    private smaNullable;
    private ema;
    private emaNullable;
    private wma;
    private standardDeviation;
    private bollingerBands;
    private trueRange;
    private atr;
    private rsi;
    private macd;
    private osma;
    private cci;
    private adx;
    private williamsR;
    private momentum;
    private stochastic;
    private awesomeOscillator;
    private acceleratorOscillator;
    private bullsPower;
    private deMarker;
    private rateOfChange;
    private parabolicSar;
    private ichimoku;
    private donchianChannel;
    private envelopes;
}
export {};
