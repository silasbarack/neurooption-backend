import { MarketDataService } from './market-data.service';
import { GetCandlesDto } from './dto/get-candles.dto';
export declare class MarketDataController {
    private readonly marketDataService;
    constructor(marketDataService: MarketDataService);
    getAssets(): Promise<{
        assets: {
            symbol: string;
            label: string;
            category: string;
            basePrice: number;
            precision: number;
            payoutBoost: number;
            isActive: boolean;
        }[];
    }>;
    getCandles(query: GetCandlesDto): Promise<{
        asset: {
            symbol: string;
            label: string;
            category: string;
            basePrice: number;
            precision: number;
            payoutBoost: number;
        };
        timeframe: string;
        serverTime: string;
        candles: {
            open: number;
            high: number;
            low: number;
            close: number;
            time: number;
            openTime: string;
            closeTime: string;
        }[];
    }>;
}
