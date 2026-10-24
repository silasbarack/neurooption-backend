import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
type HistogramName = 'market_data_ingest_latency_ms' | 'websocket_broadcast_latency_ms' | 'client_tick_age_ms' | 'candle_aggregation_time_ms' | 'client_render_delay_ms';
type CounterName = 'active_websocket_connections' | 'ticks_dropped' | 'sequence_gaps' | 'reconnect_count' | 'resync_requests' | 'stale_connections';
export declare class LatencyMetricsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly histograms;
    private readonly counters;
    private readonly transports;
    private ticksThisSecond;
    private tickSecond;
    private ticksPerSecond;
    private eventLoopDelay;
    private logTimer;
    onModuleInit(): void;
    onModuleDestroy(): void;
    observe(name: HistogramName, value: number): void;
    increment(name: CounterName, by?: number): void;
    setCounter(name: CounterName, value: number): void;
    observeTransport(name: string): void;
    markTick(at?: number): void;
    snapshot(): {
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
    private logSummary;
    private eventLoopSummary;
    private summarize;
}
export {};
