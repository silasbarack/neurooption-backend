import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { MarketDataService } from '../market-data/market-data.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { AssetPayoutUpdate, PayoutEngineService } from '../payout-engine/payout-engine.service';
export type MarketPriceUpdate = {
    symbol: string;
    price: number;
    bid: number;
    ask: number;
    time: number;
    timestamp: number;
    sequence: number;
    source: string;
    marketType: 'OTC' | 'REAL';
    serverReceiveTimestamp: number;
    serverBroadcastTimestamp: number;
    serverTime: string;
};
export type MarketCandleUpdate = {
    symbol: string;
    timeframe: string;
    sequence: number;
    serverBroadcastTimestamp: number;
    candle: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        closed: boolean;
    };
};
export declare class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly marketDataService;
    private readonly metrics;
    private readonly payoutEngine;
    server: Namespace;
    constructor(marketDataService: MarketDataService, metrics: LatencyMetricsService, payoutEngine: PayoutEngineService);
    handleConnection(client: Socket): void;
    handleDisconnect(): void;
    subscribeSymbol(client: Socket, data: {
        symbol: string;
        timeframe?: string;
    }): {
        event: string;
        message: string;
        symbol?: undefined;
        timeframe?: undefined;
        sequence?: undefined;
        serverTimestamp?: undefined;
    } | {
        event: string;
        symbol: string;
        timeframe: "S5" | "S10" | "S15" | "S30" | "M1" | "M2" | "M3" | "M5" | "M10" | "M15" | "M30" | "H1" | "H4" | "D1";
        sequence: number;
        serverTimestamp: number;
        message?: undefined;
    };
    unsubscribeSymbol(client: Socket, data: {
        symbol: string;
        timeframe?: string;
    }): {
        event: string;
        symbol: string;
        serverTimestamp: number;
    };
    serverTime(data?: {
        clientSentAt?: number;
    }): {
        event: string;
        clientSentAt: number;
        serverTimestamp: number;
        serverTime: string;
    };
    resync(client: Socket, data: {
        symbol: string;
        timeframe: string;
        since?: number;
        limit?: number;
        lastSequence?: number;
    }): Promise<{
        event: string;
        message: string;
        symbol?: undefined;
        timeframe?: undefined;
        requestedSince?: undefined;
        lastSequence?: undefined;
        serverTimestamp?: undefined;
        candles?: undefined;
    } | {
        event: string;
        symbol: string;
        timeframe: "S5" | "S10" | "S15" | "S30" | "M1" | "M2" | "M3" | "M5" | "M10" | "M15" | "M30" | "H1" | "H4" | "D1";
        requestedSince: number;
        lastSequence: number;
        serverTimestamp: number;
        candles: import("../market-data/market-data.constants").OtcCandle[];
        message?: undefined;
    }>;
    clientMetrics(client: Socket, data: {
        tickAgeMs?: number;
        renderDelayMs?: number;
        reconnect?: boolean;
        transport?: string;
    }): {
        ok: boolean;
        rateLimited: boolean;
        serverTimestamp: number;
    } | {
        ok: boolean;
        serverTimestamp: number;
        rateLimited?: undefined;
    };
    broadcastPriceUpdate(dto: MarketPriceUpdate): void;
    broadcastCandleUpdate(dto: MarketCandleUpdate): void;
    broadcastPayoutUpdate(update: AssetPayoutUpdate): void;
    symbolRoom(symbol: string): string;
    chartRoom(symbol: string, timeframe: string): string;
    private watched;
    private watchedCheckedAt;
    isWatched(symbol: string): boolean;
    roomSize(room: string): number;
    private allowEvent;
    private normalizeSymbol;
}
