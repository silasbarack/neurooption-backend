export type AssetCategory = 'Currencies' | 'Cryptocurrencies' | 'Stocks' | 'Indices' | 'Commodities';
export type MarketAsset = {
    symbol: string;
    label: string;
    category: AssetCategory;
    basePrice: number;
    precision: number;
    payoutBoost: number;
    volatility: number;
    isActive: boolean;
};
export type SeedAsset = MarketAsset;
export type SeededAsset = MarketAsset;
export type OtcCandle = {
    time: number;
    openTime: string;
    closeTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};
export { TIMEFRAME_SECONDS, SUPPORTED_TIMEFRAMES, TIMEFRAME_MS, } from './timeframe.config';
export declare const MARKET_ASSETS: MarketAsset[];
export declare const M1_CANDLE_MS: number;
export type SeedAseet = MarketAsset;
