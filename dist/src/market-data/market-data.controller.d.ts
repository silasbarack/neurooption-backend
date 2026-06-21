import { MarketDataService } from './market-data.service';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketTickQueryDto } from './dto/market-tick-query.dto';
export declare class MarketDataController {
    private readonly marketDataService;
    constructor(marketDataService: MarketDataService);
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
        candles: import("./market-data.constants").OtcCandle[];
    };
    getTick(query: MarketTickQueryDto): {
        asset: string;
        price: number;
        time: number;
        serverTime: string;
    };
}
