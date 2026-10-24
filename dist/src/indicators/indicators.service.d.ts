import { CalculateIndicatorDto } from './dto/calculate-indicator.dto';
import { IndicatorQueryDto } from './dto/indicator-query.dto';
import { IndicatorPlacement, IndicatorType } from './indicators.constants';
import { IndicatorsCalculatorService } from './indicators-calculator.service';
export declare class IndicatorsService {
    private readonly calculator;
    constructor(calculator: IndicatorsCalculatorService);
    listIndicators(): {
        name: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
    getAllDefaults(): {
        name: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
    getBottomIndicators(): {
        name: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
    getOverlayIndicators(): {
        name: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
    calculateFromCandles(dto: CalculateIndicatorDto): {
        indicator: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
        values: {
            [x: string]: number;
            time: number;
        }[] | {
            time: number;
            upper: number;
            middle: number;
            lower: number;
        }[] | {
            time: number;
            psar: number;
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
            adx: number;
            plusDi: number;
            minusDi: number;
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
        generatedAt: Date;
    };
    calculate(query: IndicatorQueryDto): {
        indicator: IndicatorType;
        label: string;
        placement: IndicatorPlacement;
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
            indicator: IndicatorType;
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
    private getDefaults;
}
