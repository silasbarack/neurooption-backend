import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { IntervalHistogram, monitorEventLoopDelay } from 'node:perf_hooks';

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
  | 'resync_requests'
  | 'stale_connections';

const HISTOGRAM_LIMIT = 2048;
const SUMMARY_LOG_INTERVAL_MS = 60_000;

/** Fixed-size ring buffer: recording a value is O(1) however full it is. */
class Ring {
  private readonly values = new Float64Array(HISTOGRAM_LIMIT);
  private next = 0;
  private size = 0;

  push(value: number) {
    this.values[this.next] = value;
    this.next = (this.next + 1) % HISTOGRAM_LIMIT;
    this.size = Math.min(this.size + 1, HISTOGRAM_LIMIT);
  }

  toArray() {
    return Array.from(this.values.subarray(0, this.size));
  }

  clear() {
    this.next = 0;
    this.size = 0;
  }
}

@Injectable()
export class LatencyMetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('MarketLatency');
  private readonly histograms = new Map<HistogramName, Ring>();
  private readonly counters = new Map<CounterName, number>();
  private readonly transports = new Map<string, number>();
  private ticksThisSecond = 0;
  private tickSecond = 0;
  private ticksPerSecond = 0;
  private eventLoopDelay: IntervalHistogram | null = null;
  private logTimer: NodeJS.Timeout | null = null;

  onModuleInit() {
    // Event-loop delay shows when the process is starved of CPU (for example
    // throttled by a small container CPU quota), which delays every tick.
    this.eventLoopDelay = monitorEventLoopDelay({ resolution: 10 });
    this.eventLoopDelay.enable();
    this.logTimer = setInterval(() => this.logSummary(), SUMMARY_LOG_INTERVAL_MS);
    this.logTimer.unref?.();
  }

  onModuleDestroy() {
    this.eventLoopDelay?.disable();
    if (this.logTimer) clearInterval(this.logTimer);
  }

  observe(name: HistogramName, value: number) {
    if (!Number.isFinite(value) || value < 0) return;

    let ring = this.histograms.get(name);
    if (!ring) {
      ring = new Ring();
      this.histograms.set(name, ring);
    }
    ring.push(value);
  }

  increment(name: CounterName, by = 1) {
    this.counters.set(name, Math.max(0, (this.counters.get(name) ?? 0) + by));
  }

  setCounter(name: CounterName, value: number) {
    this.counters.set(name, Math.max(0, Math.round(value)));
  }

  /** A client reported which Engine.IO transport it is on. */
  observeTransport(name: string) {
    const key = name === 'websocket' || name === 'polling' ? name : 'other';
    this.transports.set(key, (this.transports.get(key) ?? 0) + 1);
  }

  markTick(at = Date.now()) {
    const second = Math.floor(at / 1_000);
    if (second !== this.tickSecond) {
      this.ticksPerSecond = second === this.tickSecond + 1 ? this.ticksThisSecond : 0;
      this.tickSecond = second;
      this.ticksThisSecond = 0;
    }
    this.ticksThisSecond += 1;
  }

  snapshot() {
    const histograms = Object.fromEntries(
      Array.from(this.histograms.entries()).map(([name, ring]) => [
        name,
        this.summarize(ring.toArray()),
      ]),
    );

    return {
      timestamp: Date.now(),
      ticks_per_second: this.ticksPerSecond,
      ...Object.fromEntries(this.counters.entries()),
      event_loop_delay_ms: this.eventLoopSummary(),
      transports: Object.fromEntries(this.transports.entries()),
      histograms,
    };
  }

  /** One log line a minute so production latency can be read from the logs. */
  private logSummary() {
    const age = this.summarize(
      this.histograms.get('client_tick_age_ms')?.toArray() ?? [],
    );
    const render = this.summarize(
      this.histograms.get('client_render_delay_ms')?.toArray() ?? [],
    );
    const loop = this.eventLoopSummary();

    this.logger.log(
      JSON.stringify({
        connections: this.counters.get('active_websocket_connections') ?? 0,
        ticksPerSecond: this.ticksPerSecond,
        eventLoopDelayMs: loop,
        clientTickAgeMs: { n: age.count, p50: age.p50, p95: age.p95, max: age.max },
        clientRenderDelayMs: { n: render.count, p50: render.p50, p95: render.p95 },
        transports: Object.fromEntries(this.transports.entries()),
        resyncs: this.counters.get('resync_requests') ?? 0,
        reconnects: this.counters.get('reconnect_count') ?? 0,
      }),
    );

    // Each line covers the last minute.
    this.histograms.get('client_tick_age_ms')?.clear();
    this.histograms.get('client_render_delay_ms')?.clear();
    this.transports.clear();
    this.counters.set('resync_requests', 0);
    this.counters.set('reconnect_count', 0);
    this.eventLoopDelay?.reset();
  }

  private eventLoopSummary() {
    const h = this.eventLoopDelay;
    if (!h || h.count === 0) return { p50: 0, p99: 0, max: 0 };
    const ms = (ns: number) => Number((ns / 1e6).toFixed(1));
    return { p50: ms(h.percentile(50)), p99: ms(h.percentile(99)), max: ms(h.max) };
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
