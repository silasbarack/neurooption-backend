import { IndicatorsService } from './indicators.service';
import { IndicatorQueryDto } from './dto/indicator-query.dto';
export declare class IndicatorsController {
    private readonly indicatorsService;
    constructor(indicatorsService: IndicatorsService);
    listIndicators(): {
        name: import("./dto/indicator-query.dto").IndicatorType;
        category: string;
    }[];
    calculate(query: IndicatorQueryDto): {
        symbol: string;
        timeframe: string;
        indicator: import("./dto/indicator-query.dto").IndicatorType;
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
            indicator: import("./dto/indicator-query.dto").IndicatorType;
            value: any;
            message: string;
        }[];
        generatedAt: Date;
    };
}
