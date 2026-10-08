import { MarketDataService } from './market-data.service';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketTickQueryDto } from './dto/market-tick-query.dto';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
export declare class MarketDataController {
    private readonly marketDataService;
    private readonly latencyMetrics;
    constructor(marketDataService: MarketDataService, latencyMetrics: LatencyMetricsService);
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
        marketType: "OTC";
        source: string;
        serverTime: string;
        candles: import("./market-data.constants").OtcCandle[];
    };
    getTick(query: MarketTickQueryDto): {
        asset: string;
        price: number;
        time: number;
        serverTime: string;
    } & Record<string, unknown>;
    getMetrics(): {
        event_loop_delay_ms: {
            p50: number;
            p99: number;
            max: number;
        };
        transports: {
            [k: string]: number;
        };
        histograms: {
            [k: string]: {
                count: number;
                p50: number;
                p95: number;
                p99: number;
                max: number;
            };
        };
        timestamp: number;
        ticks_per_second: number;
    };
}
