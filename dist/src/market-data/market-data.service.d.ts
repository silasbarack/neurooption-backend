import { OnApplicationBootstrap } from '@nestjs/common';
import { OtcCandle } from './market-data.constants';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketStreamService } from './market-stream.service';
import { PayoutEngineService } from '../payout-engine/payout-engine.service';
type OtcTick = {
    asset: string;
    price: number;
    time: number;
    serverTime: string;
};
export declare class MarketDataService implements OnApplicationBootstrap {
    private readonly marketStreamService;
    private readonly payoutEngine;
    constructor(marketStreamService: MarketStreamService, payoutEngine: PayoutEngineService);
    getAssets(): {
        serverTime: string;
        categories: import("./market-data.constants").AssetCategory[];
        assets: {
            payout: number;
            payoutVersion: number;
            payoutUpdatedAt: string;
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
    private payoutFields;
    getPayouts(): {
        serverTime: string;
        marketType: "OTC";
        note: string;
        expiryAdjustments: {
            maxSeconds?: number;
            minSeconds?: number;
            adjustPercent: number;
        }[];
        bounds: {
            minPercent: number;
            maxPercent: number;
        };
        payouts: import("../payout-engine/payout-engine.service").AssetPayoutSnapshot[];
    };
    getQuotes(): {
        serverTime: string;
        quotes: {
            payout: number;
            payoutVersion: number;
            payoutUpdatedAt: string;
            symbol: string;
            label: string;
            category: import("./market-data.constants").AssetCategory;
            precision: number;
            price: number;
            changePercent: number;
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
