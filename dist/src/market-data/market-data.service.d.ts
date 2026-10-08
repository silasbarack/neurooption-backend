import { OnApplicationBootstrap } from '@nestjs/common';
import { OtcCandle } from './market-data.constants';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketStreamService } from './market-stream.service';
type OtcTick = {
    asset: string;
    price: number;
    time: number;
    serverTime: string;
};
export declare class MarketDataService implements OnApplicationBootstrap {
    private readonly marketStreamService;
    constructor(marketStreamService: MarketStreamService);
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
            marketType: "OTC";
            source: string;
        }[];
    };
    getQuotes(): {
        serverTime: string;
        quotes: {
            symbol: string;
            label: string;
            category: import("./market-data.constants").AssetCategory;
            precision: number;
            price: number;
            changePercent: number;
            payout: number;
        }[];
    };
    getCategories(): import("./market-data.constants").AssetCategory[];
    getTick(assetSymbol: string): OtcTick & Record<string, unknown>;
    onApplicationBootstrap(): void;
    private readonly historyCache;
    private historyFor;
    getCandles(query: MarketCandlesQueryDto): Promise<{
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
        marketType: "OTC";
        source: string;
        serverTime: string;
        candles: OtcCandle[];
    }>;
    getLatestCandle(assetSymbol: string, timeframe: string): OtcCandle;
    private buildCandle;
    private priceAt;
    private readonly dnaCache;
    private getAssetDna;
    private computeAssetDna;
    private regimeMove;
    private stepMove;
    private impulse;
    private buildWick;
    private regimeIndecisionChance;
    private regimeReversalChance;
    private regimeCleanChance;
    private multiNoise;
    private interpolatedNoise;
    private sessionMove;
    private buildTickVolume;
    private getSampleStepMs;
    private getCategoryMultiplier;
    private seededRandom;
    private hashSeed;
    private roundPrice;
    private normalizeTimeframe;
    private normalizeLimit;
    private findAsset;
}
export {};
