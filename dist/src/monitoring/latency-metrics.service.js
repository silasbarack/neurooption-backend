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
const HISTOGRAM_LIMIT = 2048;
let LatencyMetricsService = class LatencyMetricsService {
    constructor() {
        this.histograms = new Map();
        this.counters = new Map();
        this.recentTicks = [];
    }
    observe(name, value) {
        if (!Number.isFinite(value) || value < 0)
            return;
        const values = this.histograms.get(name) ?? [];
        values.push(value);
        if (values.length > HISTOGRAM_LIMIT) {
            values.splice(0, values.length - HISTOGRAM_LIMIT);
        }
        this.histograms.set(name, values);
    }
    increment(name, by = 1) {
        this.counters.set(name, Math.max(0, (this.counters.get(name) ?? 0) + by));
    }
    setCounter(name, value) {
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
        const histograms = Object.fromEntries(Array.from(this.histograms.entries()).map(([name, values]) => [
            name,
            this.summarize(values),
        ]));
        return {
            timestamp: Date.now(),
            ticks_per_second: this.recentTicks.length,
            ...Object.fromEntries(this.counters.entries()),
            histograms,
        };
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