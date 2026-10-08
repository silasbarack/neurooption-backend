import { MarketDataService } from './market-data.service';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketTickQueryDto } from './dto/market-tick-query.dto';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { PayoutEngineService } from '../payout-engine/payout-engine.service';
export declare class MarketDataController {
    private readonly marketDataService;
    private readonly latencyMetrics;
    private readonly payoutEngine;
    constructor(marketDataService: MarketDataService, latencyMetrics: LatencyMetricsService, payoutEngine: PayoutEngineService);
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
    getPayoutQuote(asset: string, expirySeconds?: string): import("../payout-engine/payout-engine.service").PayoutQuote;
    getPayoutDiagnostics(asset: string): {
        smoothedTargetPercent: number;
        lastReviewedAt: string;
        movementLastHour: import("../payout-engine/payout-smoothing").PayoutChange[];
        target: import("../payout-engine/payout-model").PayoutTarget;
        metrics: import("../payout-engine/payout-model").MarketConditionMetrics;
        leader: boolean;
        assetId: string;
        symbol: string;
        payoutPercent: number;
        previousPercent: number | null;
        marketType: "OTC" | "REAL";
        category: string;
        version: number;
        updatedAt: string;
        reason: string;
        baselinePercent: number;
        targetPercent: number | null;
    };
    getPayoutHistory(asset: string, limit?: string): Promise<{
        asset: string;
        history: import("../payout-engine/payout-repository").PayoutHistoryEntry[];
    }>;
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
        candles: import("./market-data.constants").OtcCandle[];
    }>;
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
