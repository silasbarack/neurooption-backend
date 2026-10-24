import { IndicatorsService } from './indicators.service';
import { IndicatorQueryDto } from './dto/indicator-query.dto';
export declare class IndicatorsController {
    private readonly indicatorsService;
    constructor(indicatorsService: IndicatorsService);
    listIndicators(): {
        name: import("./indicators.constants").IndicatorType;
        label: string;
        placement: import("./indicators.constants").IndicatorPlacement;
        category: string;
        defaultParams: {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
            deviation: number;
        } | {
            step: number;
            max: number;
        } | {
            conversionPeriod: number;
            basePeriod: number;
            spanBPeriod: number;
            displacement: number;
        } | {
            period: number;
        } | {
            period: number;
            deviationPercent: number;
        } | {
            fastPeriod: number;
            slowPeriod: number;
        } | {
            period: number;
            overbought: number;
            oversold: number;
        } | {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            period: number;
            upperLevel: number;
            lowerLevel: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
            overbought: number;
            oversold: number;
        } | {
            period: number;
        } | {
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        } | {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        } | {
            period: number;
        };
    }[];
    calculate(query: IndicatorQueryDto): {
        indicator: import("./indicators.constants").IndicatorType;
        label: string;
        placement: import("./indicators.constants").IndicatorPlacement;
        params: {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
            deviation: number;
        } | {
            period?: number;
            step: number;
            max: number;
        } | {
            period?: number;
            conversionPeriod: number;
            basePeriod: number;
            spanBPeriod: number;
            displacement: number;
        } | {
            period: number;
        } | {
            period: number;
            deviationPercent: number;
        } | {
            period?: number;
            fastPeriod: number;
            slowPeriod: number;
        } | {
            period: number;
            overbought: number;
            oversold: number;
        } | {
            period?: number;
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            period: number;
            upperLevel: number;
            lowerLevel: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
            overbought: number;
            oversold: number;
        } | {
            period: number;
        } | {
            period?: number;
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        } | {
            period?: number;
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            period?: number;
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period: number;
        } | {
            period?: number;
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        } | {
            period: number;
        };
        message: string;
        exampleBody: {
            indicator: import("./indicators.constants").IndicatorType;
            candles: {
                time: number;
                open: number;
                high: number;
                low: number;
                close: number;
            }[];
            params: {
                period: number;
            } | {
                period: number;
            } | {
                period: number;
            } | {
                period: number;
                deviation: number;
            } | {
                period?: number;
                step: number;
                max: number;
            } | {
                period?: number;
                conversionPeriod: number;
                basePeriod: number;
                spanBPeriod: number;
                displacement: number;
            } | {
                period: number;
            } | {
                period: number;
                deviationPercent: number;
            } | {
                period?: number;
                fastPeriod: number;
                slowPeriod: number;
            } | {
                period: number;
                overbought: number;
                oversold: number;
            } | {
                period?: number;
                fastPeriod: number;
                slowPeriod: number;
                signalPeriod: number;
            } | {
                period: number;
                upperLevel: number;
                lowerLevel: number;
            } | {
                period: number;
            } | {
                period: number;
            } | {
                period: number;
                overbought: number;
                oversold: number;
            } | {
                period: number;
            } | {
                period?: number;
                kPeriod: number;
                dPeriod: number;
                slowing: number;
                overbought: number;
                oversold: number;
            } | {
                period?: number;
                fastPeriod: number;
                slowPeriod: number;
                signalPeriod: number;
            } | {
                period?: number;
                fastPeriod: number;
                slowPeriod: number;
                signalPeriod: number;
            } | {
                period: number;
            } | {
                period: number;
            } | {
                period: number;
            } | {
                period?: number;
                kPeriod: number;
                dPeriod: number;
                slowing: number;
                overbought: number;
                oversold: number;
            } | {
                period: number;
            };
        };
        generatedAt: Date;
    };
}
