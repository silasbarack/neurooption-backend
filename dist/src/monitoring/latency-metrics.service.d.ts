type HistogramName = 'market_data_ingest_latency_ms' | 'websocket_broadcast_latency_ms' | 'client_tick_age_ms' | 'candle_aggregation_time_ms' | 'client_render_delay_ms';
type CounterName = 'active_websocket_connections' | 'ticks_dropped' | 'sequence_gaps' | 'reconnect_count' | 'stale_connections';
export declare class LatencyMetricsService {
    private readonly histograms;
    private readonly counters;
    private readonly recentTicks;
    observe(name: HistogramName, value: number): void;
    increment(name: CounterName, by?: number): void;
    setCounter(name: CounterName, value: number): void;
    markTick(at?: number): void;
    snapshot(): {
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
    private summarize;
}
export {};
