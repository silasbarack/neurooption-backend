export declare enum IndicatorPlacement {
    OVERLAY = "OVERLAY",
    BOTTOM = "BOTTOM"
}
export declare enum IndicatorType {
    SMA = "SMA",
    EMA = "EMA",
    WMA = "WMA",
    BOLLINGER_BANDS = "BOLLINGER_BANDS",
    PARABOLIC_SAR = "PARABOLIC_SAR",
    ICHIMOKU = "ICHIMOKU",
    DONCHIAN_CHANNEL = "DONCHIAN_CHANNEL",
    ENVELOPES = "ENVELOPES",
    AWESOME_OSCILLATOR = "AWESOME_OSCILLATOR",
    RSI = "RSI",
    MACD = "MACD",
    CCI = "CCI",
    ADX = "ADX",
    ATR = "ATR",
    WILLIAMS_R = "WILLIAMS_R",
    MOMENTUM = "MOMENTUM",
    STOCHASTIC_OSCILLATOR = "STOCHASTIC_OSCILLATOR",
    OSMA = "OSMA",
    ACCELERATOR_OSCILLATOR = "ACCELERATOR_OSCILLATOR",
    BULLS_POWER = "BULLS_POWER",
    DEMARKER = "DEMARKER",
    RATE_OF_CHANGE = "RATE_OF_CHANGE",
    STOCHASTIC = "STOCHASTIC",
    ROC = "ROC"
}
export declare const INDICATOR_DEFAULTS: {
    SMA: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    EMA: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    WMA: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    BOLLINGER_BANDS: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
            deviation: number;
        };
    };
    PARABOLIC_SAR: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            step: number;
            max: number;
        };
    };
    ICHIMOKU: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            conversionPeriod: number;
            basePeriod: number;
            spanBPeriod: number;
            displacement: number;
        };
    };
    DONCHIAN_CHANNEL: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    ENVELOPES: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
            deviationPercent: number;
        };
    };
    AWESOME_OSCILLATOR: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            fastPeriod: number;
            slowPeriod: number;
        };
    };
    RSI: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
            overbought: number;
            oversold: number;
        };
    };
    MACD: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        };
    };
    CCI: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
            upperLevel: number;
            lowerLevel: number;
        };
    };
    ADX: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    ATR: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    WILLIAMS_R: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
            overbought: number;
            oversold: number;
        };
    };
    MOMENTUM: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    STOCHASTIC_OSCILLATOR: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        };
    };
    OSMA: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        };
    };
    ACCELERATOR_OSCILLATOR: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        };
    };
    BULLS_POWER: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    DEMARKER: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    RATE_OF_CHANGE: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
    STOCHASTIC: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            kPeriod: number;
            dPeriod: number;
            slowing: number;
            overbought: number;
            oversold: number;
        };
    };
    ROC: {
        placement: IndicatorPlacement;
        label: string;
        params: {
            period: number;
        };
    };
};
export declare function normalizeIndicatorType(indicator: IndicatorType): IndicatorType;
