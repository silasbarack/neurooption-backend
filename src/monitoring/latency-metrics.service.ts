import { Injectable } from '@nestjs/common';

type HistogramName =
  | 'market_data_ingest_latency_ms'
  | 'websocket_broadcast_latency_ms'
  | 'client_tick_age_ms'
  | 'candle_aggregation_time_ms'
  | 'client_render_delay_ms';

type CounterName =
  | 'active_websocket_connections'
  | 'ticks_dropped'
  | 'sequence_gaps'
  | 'reconnect_count'
  | 'stale_connections';

const HISTOGRAM_LIMIT = 2048;

@Injectable()
export class LatencyMetricsService {
  private readonly histograms = new Map<HistogramName, number[]>();
  private readonly counters = new Map<CounterName, number>();
  private readonly recentTicks: number[] = [];

  observe(name: HistogramName, value: number) {
    if (!Number.isFinite(value) || value < 0) return;

    const values = this.histograms.get(name) ?? [];
    values.push(value);

    if (values.length > HISTOGRAM_LIMIT) {
      values.splice(0, values.length - HISTOGRAM_LIMIT);
    }

    this.histograms.set(name, values);
  }

  increment(name: CounterName, by = 1) {
    this.counters.set(name, Math.max(0, (this.counters.get(name) ?? 0) + by));
  }

  setCounter(name: CounterName, value: number) {
    this.counters.set(name, Math.max(0, Math.round(value)));
  }

  markTick(at = Date.now()) {
    this.recentTicks.push(at);
    const cutoff = at - 1_000;

    while (this.recentTicks.length > 0 && this.recentTicks[0] < cutoff) {
      this.recentTicks.shift();
    }
  }

  snapshot() {
    const histograms = Object.fromEntries(
      Array.from(this.histograms.entries()).map(([name, values]) => [
        name,
        this.summarize(values),
      ]),
    );

    return {
      timestamp: Date.now(),
      ticks_per_second: this.recentTicks.length,
      ...Object.fromEntries(this.counters.entries()),
      histograms,
    };
  }

  private summarize(values: number[]) {
    if (values.length === 0) {
      return { count: 0, p50: 0, p95: 0, p99: 0, max: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);

    const percentile = (ratio: number) => {
      const index = Math.min(
        sorted.length - 1,
        Math.max(0, Math.ceil(sorted.length * ratio) - 1),
      );
      return Number(sorted[index].toFixed(3));
    };

    return {
      count: sorted.length,
      p50: percentile(0.5),
      p95: percentile(0.95),
      p99: percentile(0.99),
      max: Number(sorted[sorted.length - 1].toFixed(3)),
    };
  }
}
