import { CandlesService } from '../candles/candles.service';
import { IndicatorQueryDto, IndicatorType } from './dto/indicator-query.dto';
export declare class IndicatorsService {
    private readonly candlesService;
    constructor(candlesService: CandlesService);
    calculate(query: IndicatorQueryDto): {
        symbol: string;
        timeframe: string;
        indicator: IndicatorType;
        values: {
            time: any;
            value: number;
        }[] | {
            time: any;
            macd: number;
            signal: number;
            histogram: number;
        }[] | {
            time: any;
            upper: number;
            middle: number;
            lower: number;
        }[] | {
            time: any;
            k: number;
            d: any;
        }[] | {
            time: any;
            pivot: number;
            resistance1: number;
            support1: number;
            resistance2: number;
            support2: number;
        }[] | {
            time: any;
            indicator: IndicatorType;
            value: any;
            message: string;
        }[];
        generatedAt: Date;
    };
    listIndicators(): {
        name: IndicatorType;
        category: string;
    }[];
    private calculateIndicator;
    private sma;
    private ema;
    private wma;
    private rsi;
    private macd;
    private bollingerBands;
    private stochastic;
    private atr;
    private cci;
    private momentum;
    private roc;
    private williamsR;
    private vwap;
    private obv;
    private mfi;
    private standardDeviation;
    private donchianChannel;
    private pivotPoints;
    private placeholder;
    private getCategory;
}
