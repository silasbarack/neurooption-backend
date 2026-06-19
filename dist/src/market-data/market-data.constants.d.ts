export type SeedAsset = {
    symbol: string;
    label: string;
    category: string;
    basePrice: number;
    precision: number;
    payoutBoost: number;
};
export declare const OTC_TIMEFRAME = "M1";
export declare const M1_CANDLE_MS = 60000;
export declare const DEFAULT_CANDLE_LIMIT = 120;
export declare const MAX_CANDLE_LIMIT = 500;
export declare const OTC_ASSETS: SeedAsset[];
