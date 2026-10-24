"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatencyMetricsService = void 0;
const common_1 = require("@nestjs/common");
const node_perf_hooks_1 = require("node:perf_hooks");
const HISTOGRAM_LIMIT = 2048;
const SUMMARY_LOG_INTERVAL_MS = 60_000;
class Ring {
    constructor() {
        this.values = new Float64Array(HISTOGRAM_LIMIT);
        this.next = 0;
        this.size = 0;
    }
    push(value) {
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
let LatencyMetricsService = class LatencyMetricsService {
    constructor() {
        this.logger = new common_1.Logger('MarketLatency');
        this.histograms = new Map();
        this.counters = new Map();
        this.transports = new Map();
        this.ticksThisSecond = 0;
        this.tickSecond = 0;
        this.ticksPerSecond = 0;
        this.eventLoopDelay = null;
        this.logTimer = null;
    }
    onModuleInit() {
        this.eventLoopDelay = (0, node_perf_hooks_1.monitorEventLoopDelay)({ resolution: 10 });
        this.eventLoopDelay.enable();
        this.logTimer = setInterval(() => this.logSummary(), SUMMARY_LOG_INTERVAL_MS);
        this.logTimer.unref?.();
    }
    onModuleDestroy() {
        this.eventLoopDelay?.disable();
        if (this.logTimer)
            clearInterval(this.logTimer);
    }
    observe(name, value) {
        if (!Number.isFinite(value) || value < 0)
            return;
        let ring = this.histograms.get(name);
        if (!ring) {
            ring = new Ring();
            this.histograms.set(name, ring);
        }
        ring.push(value);
    }
    increment(name, by = 1) {
        this.counters.set(name, Math.max(0, (this.counters.get(name) ?? 0) + by));
    }
    setCounter(name, value) {
        this.counters.set(name, Math.max(0, Math.round(value)));
    }
    observeTransport(name) {
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
        const histograms = Object.fromEntries(Array.from(this.histograms.entries()).map(([name, ring]) => [
            name,
            this.summarize(ring.toArray()),
        ]));
        return {
            timestamp: Date.now(),
            ticks_per_second: this.ticksPerSecond,
            ...Object.fromEntries(this.counters.entries()),
            event_loop_delay_ms: this.eventLoopSummary(),
            transports: Object.fromEntries(this.transports.entries()),
            histograms,
        };
    }
    logSummary() {
        const age = this.summarize(this.histograms.get('client_tick_age_ms')?.toArray() ?? []);
        const render = this.summarize(this.histograms.get('client_render_delay_ms')?.toArray() ?? []);
        const loop = this.eventLoopSummary();
        this.logger.log(JSON.stringify({
            connections: this.counters.get('active_websocket_connections') ?? 0,
            ticksPerSecond: this.ticksPerSecond,
            eventLoopDelayMs: loop,
            clientTickAgeMs: { n: age.count, p50: age.p50, p95: age.p95, max: age.max },
            clientRenderDelayMs: { n: render.count, p50: render.p50, p95: render.p95 },
            transports: Object.fromEntries(this.transports.entries()),
            resyncs: this.counters.get('resync_requests') ?? 0,
            reconnects: this.counters.get('reconnect_count') ?? 0,
        }));
        this.histograms.get('client_tick_age_ms')?.clear();
        this.histograms.get('client_render_delay_ms')?.clear();
        this.transports.clear();
        this.counters.set('resync_requests', 0);
        this.counters.set('reconnect_count', 0);
        this.eventLoopDelay?.reset();
    }
    eventLoopSummary() {
        const h = this.eventLoopDelay;
        if (!h || h.count === 0)
            return { p50: 0, p99: 0, max: 0 };
        const ms = (ns) => Number((ns / 1e6).toFixed(1));
        return { p50: ms(h.percentile(50)), p99: ms(h.percentile(99)), max: ms(h.max) };
    }
    summarize(values) {
        if (values.length === 0) {
            return { count: 0, p50: 0, p95: 0, p99: 0, max: 0 };
        }
        const sorted = [...values].sort((a, b) => a - b);
        const percentile = (ratio) => {
            const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
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
};
exports.LatencyMetricsService = LatencyMetricsService;
exports.LatencyMetricsService = LatencyMetricsService = __decorate([
    (0, common_1.Injectable)()
], LatencyMetricsService);
//# sourceMappingURL=latency-metrics.service.js.map