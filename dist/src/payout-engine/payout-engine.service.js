"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutEngineService = exports.PAYOUT_ENGINE_CONFIG = exports.PAYOUT_REPOSITORY = void 0;
exports.baselinePayout = baselinePayout;
const common_1 = require("@nestjs/common");
const market_data_constants_1 = require("../market-data/market-data.constants");
const market_condition_service_1 = require("./market-condition.service");
const payout_engine_config_1 = require("./payout-engine.config");
const payout_model_1 = require("./payout-model");
const payout_repository_1 = require("./payout-repository");
const payout_smoothing_1 = require("./payout-smoothing");
exports.PAYOUT_REPOSITORY = Symbol('PAYOUT_REPOSITORY');
exports.PAYOUT_ENGINE_CONFIG = Symbol('PAYOUT_ENGINE_CONFIG');
const HOUR_MS = 60 * 60_000;
function baselinePayout(asset, config) {
    return (0, payout_smoothing_1.clampPercent)(Math.round(83 + asset.payoutBoost), config);
}
let PayoutEngineService = class PayoutEngineService {
    constructor(conditions, repository, config) {
        this.conditions = conditions;
        this.logger = new common_1.Logger('PayoutEngine');
        this.runtimes = new Map();
        this.bySymbolLower = new Map();
        this.listeners = new Set();
        this.timer = null;
        this.cycleRunning = false;
        this.leaderLastCycle = false;
        this.repository = repository ?? new payout_repository_1.NoopPayoutRepository();
        this.config = config ?? payout_engine_config_1.DEFAULT_PAYOUT_ENGINE_CONFIG;
        this.resetRuntimes(Date.now());
    }
    async onModuleInit() {
        await this.initialize();
        if (process.env.PAYOUT_ENGINE_ENABLED === 'false') {
            this.logger.warn('Dynamic payouts disabled (PAYOUT_ENGINE_ENABLED=false); serving held payouts.');
            return;
        }
        this.timer = setInterval(() => {
            void this.runCycle();
        }, this.config.evaluationIntervalMs);
        this.timer.unref?.();
    }
    async onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
        this.timer = null;
        this.listeners.clear();
        await this.repository.close().catch(() => undefined);
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    async initialize(now = Date.now()) {
        this.resetRuntimes(now);
        if (!this.repository.enabled) {
            this.logger.log('No database configured: payout state is kept in memory.');
            return;
        }
        try {
            const [states, changes] = await Promise.all([
                this.repository.loadStates(),
                this.repository.loadChangesSince(now - HOUR_MS),
            ]);
            this.adoptStored(states, changes, false);
            this.logger.log(`Loaded ${states.length} stored asset payouts.`);
        }
        catch (error) {
            this.logger.error(`Could not load stored payouts; starting from baselines: ${error.message}`);
        }
    }
    async runCycle(now = Date.now()) {
        if (this.cycleRunning)
            return;
        this.cycleRunning = true;
        try {
            for (const runtime of this.runtimes.values()) {
                const metrics = this.conditions.measure(runtime.asset.symbol, now);
                runtime.metrics = metrics;
                runtime.target = (0, payout_model_1.computeTargetPayout)(metrics, runtime.baseline, this.config);
            }
            if (!this.repository.enabled) {
                this.decideAll(now).forEach((update) => this.emit(update));
                return;
            }
            try {
                const commit = await this.repository.withLeaderLock((session) => this.leaderCycle(session, now));
                this.leaderLastCycle = commit !== null;
                if (commit) {
                    commit().forEach((update) => this.emit(update));
                }
                else {
                    await this.followerSync(now);
                }
            }
            catch (error) {
                this.logger.warn(`Payout cycle skipped: ${error.message}`);
            }
        }
        finally {
            this.cycleRunning = false;
        }
    }
    quote(symbol, expirySeconds, now = Date.now()) {
        const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
        if (!runtime)
            return null;
        const adjustment = (0, payout_engine_config_1.expiryAdjustment)(expirySeconds);
        return {
            symbol: runtime.asset.symbol,
            marketType: runtime.marketType,
            payoutPercent: (0, payout_smoothing_1.clampPercent)(runtime.smoothing.displayed + adjustment, this.config),
            assetPayoutPercent: runtime.smoothing.displayed,
            expiryAdjustmentPercent: adjustment,
            expirySeconds,
            version: runtime.version,
            quotedAt: new Date(now).toISOString(),
        };
    }
    getSnapshot(symbol) {
        const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
        return runtime ? this.toSnapshot(runtime) : null;
    }
    listSnapshots() {
        return Array.from(this.runtimes.values()).map((runtime) => this.toSnapshot(runtime));
    }
    getDiagnostics(symbol) {
        const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
        if (!runtime)
            return null;
        return {
            ...this.toSnapshot(runtime),
            smoothedTargetPercent: runtime.smoothing.smoothed,
            lastReviewedAt: new Date(runtime.smoothing.lastReviewedAt).toISOString(),
            movementLastHour: runtime.smoothing.changes,
            target: runtime.target,
            metrics: runtime.metrics,
            leader: this.leaderLastCycle,
        };
    }
    getHistory(symbol, limit = 50) {
        const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
        if (!runtime)
            return Promise.resolve([]);
        return this.repository.loadHistory(runtime.asset.symbol, Math.min(Math.max(limit, 1), 200));
    }
    publicConfig() {
        return { ...this.config, expiryAdjustments: payout_engine_config_1.EXPIRY_ADJUSTMENTS };
    }
    resetRuntimes(now) {
        this.runtimes.clear();
        this.bySymbolLower.clear();
        for (const asset of market_data_constants_1.MARKET_ASSETS) {
            if (!asset.isActive)
                continue;
            const baseline = baselinePayout(asset, this.config);
            const runtime = {
                asset,
                marketType: 'OTC',
                baseline,
                phaseMs: (0, payout_smoothing_1.reviewPhaseMs)(asset.symbol, this.config),
                version: 1,
                smoothing: {
                    displayed: baseline,
                    smoothed: null,
                    lastChangedAt: now,
                    lastReviewedAt: now,
                    changes: [],
                },
                reason: 'INITIAL_BASELINE',
                target: null,
                metrics: null,
            };
            this.runtimes.set(asset.symbol, runtime);
            this.bySymbolLower.set(asset.symbol.toLowerCase(), runtime);
        }
    }
    decideAll(now) {
        const updates = [];
        for (const runtime of this.runtimes.values()) {
            const decision = (0, payout_smoothing_1.decidePayout)(runtime.smoothing, runtime.target?.targetPercent ?? null, now, runtime.phaseMs, this.config);
            runtime.smoothing.smoothed = decision.smoothed;
            if (decision.reviewed)
                runtime.smoothing.lastReviewedAt = now;
            if (decision.next === null)
                continue;
            const previous = runtime.smoothing.displayed;
            runtime.smoothing = (0, payout_smoothing_1.applyChange)(runtime.smoothing, decision.next, now);
            runtime.version += 1;
            runtime.reason = this.reasonText(decision.reason, runtime, previous);
            updates.push(this.toUpdate(runtime, previous));
        }
        return updates;
    }
    async leaderCycle(session, now) {
        const stored = await session.loadStates();
        const changes = await session.loadChangesSince(now - HOUR_MS);
        const storedSymbols = new Set(stored.map((row) => row.assetSymbol));
        const adopted = this.adoptStored(stored, changes, true);
        const missing = Array.from(this.runtimes.values()).filter((runtime) => !storedSymbols.has(runtime.asset.symbol));
        await session.insertMissing(missing.map((runtime) => ({
            assetSymbol: runtime.asset.symbol,
            marketType: runtime.marketType,
            category: runtime.asset.category,
            payoutPercent: runtime.smoothing.displayed,
            baselinePercent: runtime.baseline,
            version: runtime.version,
            lastChangedAt: runtime.smoothing.lastChangedAt,
            lastReviewedAt: runtime.smoothing.lastReviewedAt,
            reason: runtime.reason,
        })));
        const published = [];
        const evaluations = [];
        for (const runtime of this.runtimes.values()) {
            const decision = (0, payout_smoothing_1.decidePayout)(runtime.smoothing, runtime.target?.targetPercent ?? null, now, runtime.phaseMs, this.config);
            runtime.smoothing.smoothed = decision.smoothed;
            if (decision.reviewed)
                runtime.smoothing.lastReviewedAt = now;
            if (decision.next !== null) {
                const reason = this.reasonText(decision.reason, runtime, runtime.smoothing.displayed, decision.next);
                const ok = await session.publishChange({
                    assetSymbol: runtime.asset.symbol,
                    expectedVersion: runtime.version,
                    previousPercent: runtime.smoothing.displayed,
                    payoutPercent: decision.next,
                    targetPercent: runtime.target?.targetPercent ?? null,
                    smoothedPercent: decision.smoothed,
                    changedAt: now,
                    reason,
                    riskMetrics: { metrics: runtime.metrics, components: runtime.target?.components ?? null },
                    config: this.config,
                });
                if (ok)
                    published.push({ runtime, next: decision.next, reason });
            }
            evaluations.push({
                assetSymbol: runtime.asset.symbol,
                targetPercent: runtime.target?.targetPercent ?? null,
                smoothedPercent: decision.smoothed,
                lastReviewedAt: runtime.smoothing.lastReviewedAt,
                riskMetrics: { metrics: runtime.metrics, components: runtime.target?.components ?? null },
            });
        }
        await session.saveEvaluations(evaluations, now);
        return () => {
            const updates = [...adopted];
            for (const { runtime, next, reason } of published) {
                const previous = runtime.smoothing.displayed;
                runtime.smoothing = (0, payout_smoothing_1.applyChange)(runtime.smoothing, next, now);
                runtime.version += 1;
                runtime.reason = reason;
                updates.push(this.toUpdate(runtime, previous));
            }
            return updates;
        };
    }
    async followerSync(now) {
        const [stored, changes] = await Promise.all([
            this.repository.loadStates(),
            this.repository.loadChangesSince(now - HOUR_MS),
        ]);
        this.adoptStored(stored, changes, true).forEach((update) => this.emit(update));
    }
    adoptStored(stored, changes, collect) {
        const changesBySymbol = new Map();
        for (const change of changes) {
            const list = changesBySymbol.get(change.assetSymbol) ?? [];
            list.push({ at: change.createdAt, delta: change.payoutPercent - (change.previousPercent ?? change.payoutPercent) });
            changesBySymbol.set(change.assetSymbol, list);
        }
        const updates = [];
        for (const row of stored) {
            const runtime = this.runtimes.get(row.assetSymbol);
            if (!runtime)
                continue;
            runtime.smoothing.changes = changesBySymbol.get(row.assetSymbol) ?? [];
            runtime.smoothing.lastReviewedAt = Math.max(runtime.smoothing.lastReviewedAt, row.lastReviewedAt);
            if (runtime.smoothing.smoothed === null && row.smoothedPercent !== null) {
                runtime.smoothing.smoothed = row.smoothedPercent;
            }
            if (row.version < runtime.version)
                continue;
            if (row.version === runtime.version && row.payoutPercent === runtime.smoothing.displayed) {
                runtime.smoothing.lastChangedAt = row.lastChangedAt;
                continue;
            }
            const previous = runtime.smoothing.displayed;
            runtime.smoothing.displayed = row.payoutPercent;
            runtime.smoothing.lastChangedAt = row.lastChangedAt;
            runtime.version = row.version;
            runtime.reason = 'SYNCED_FROM_STORE';
            if (collect)
                updates.push(this.toUpdate(runtime, previous));
        }
        return updates;
    }
    reasonText(code, runtime, from, to = runtime.smoothing.displayed) {
        const target = runtime.target;
        const smoothed = runtime.smoothing.smoothed;
        const detail = target
            ? `target ${target.targetPercent.toFixed(2)}% (smoothed ${smoothed === null ? 'n/a' : smoothed.toFixed(2)}%, baseline ${target.baselinePercent}%): ${(0, payout_model_1.describeTarget)(target)}`
            : 'no market target';
        return `${code} ${from}%→${to}%; ${detail}`;
    }
    toUpdate(runtime, previous) {
        return {
            assetId: runtime.asset.symbol,
            symbol: runtime.asset.symbol,
            payoutPercent: runtime.smoothing.displayed,
            previousPercent: previous,
            marketType: runtime.marketType,
            category: runtime.asset.category,
            version: runtime.version,
            updatedAt: new Date(runtime.smoothing.lastChangedAt).toISOString(),
            reason: runtime.reason,
        };
    }
    toSnapshot(runtime) {
        return {
            ...this.toUpdate(runtime, null),
            baselinePercent: runtime.baseline,
            targetPercent: runtime.target?.targetPercent ?? null,
        };
    }
    emit(update) {
        for (const listener of this.listeners) {
            try {
                listener(update);
            }
            catch (error) {
                this.logger.warn(`Payout listener failed: ${error.message}`);
            }
        }
    }
};
exports.PayoutEngineService = PayoutEngineService;
exports.PayoutEngineService = PayoutEngineService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)(exports.PAYOUT_REPOSITORY)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(exports.PAYOUT_ENGINE_CONFIG)),
    __metadata("design:paramtypes", [market_condition_service_1.MarketConditionService, Object, Object])
], PayoutEngineService);
//# sourceMappingURL=payout-engine.service.js.map