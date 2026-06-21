import { OtcCandle } from './market-data.constants';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
type OtcTick = {
    asset: string;
    price: number;
    time: number;
    serverTime: string;
};
export declare class MarketDataService {
    getAssets(): {
        serverTime: string;
        categories: import("./market-data.constants").AssetCategory[];
        assets: {
            symbol: string;
            label: string;
            category: import("./market-data.constants").AssetCategory;
            basePrice: number;
            precision: number;
            payoutBoost: number;
            isActive: boolean;
        }[];
    };
    getCategories(): import("./market-data.constants").AssetCategory[];
    getTick(assetSymbol: string): OtcTick;
    getCandles(query: MarketCandlesQueryDto): {
        asset: {
            symbol: string;
            label: string;
            category: import("./market-data.constants").AssetCategory;
            basePrice: number;
            precision: number;
            payoutBoost: number;
            isActive: boolean;
        };
        timeframe: string;
        timeframeSeconds: number;
        serverTime: string;
        candles: OtcCandle[];
    };
    private buildCandle;
    private priceAt;
    private getSampleStepMs;
    private buildWick;
    private buildTickVolume;
    private interpolatedNoise;
    private sessionVolatilityMultiplier;
    private seededRandom;
    private assetSeed;
    private roundPrice;
    private normalizeTimeframe;
    private normalizeLimit;
    private findAsset;
}
export {};
