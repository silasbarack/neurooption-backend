import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { MARKET_ASSETS, MarketAsset } from '../market-data/market-data.constants';
import { MarketConditionService } from './market-condition.service';
import {
  DEFAULT_PAYOUT_ENGINE_CONFIG,
  EXPIRY_ADJUSTMENTS,
  PayoutEngineConfig,
  expiryAdjustment,
} from './payout-engine.config';
import {
  MarketConditionMetrics,
  PayoutTarget,
  computeTargetPayout,
  describeTarget,
} from './payout-model';
import {
  NoopPayoutRepository,
  LeaderSession,
  PayoutHistoryEntry,
  PayoutRepository,
  StoredPayoutState,
} from './payout-repository';
import {
  PayoutChange,
  SmoothingState,
  applyChange,
  clampPercent,
  decidePayout,
  reviewPhaseMs,
} from './payout-smoothing';

export const PAYOUT_REPOSITORY = Symbol('PAYOUT_REPOSITORY');
export const PAYOUT_ENGINE_CONFIG = Symbol('PAYOUT_ENGINE_CONFIG');

const HOUR_MS = 60 * 60_000;

export type AssetPayoutUpdate = {
  assetId: string;
  symbol: string;
  payoutPercent: number;
  previousPercent: number | null;
  marketType: 'OTC' | 'REAL';
  category: string;
  version: number;
  updatedAt: string;
  reason: string;
};

export type AssetPayoutSnapshot = AssetPayoutUpdate & {
  baselinePercent: number;
  targetPercent: number | null;
};

export type PayoutQuote = {
  symbol: string;
  marketType: 'OTC' | 'REAL';
  /** What a trade with this expiry pays if it wins. */
  payoutPercent: number;
  /** The asset payout (60-second reference) the quote is based on. */
  assetPayoutPercent: number;
  expiryAdjustmentPercent: number;
  expirySeconds: number;
  version: number;
  quotedAt: string;
};

type AssetRuntime = {
  asset: MarketAsset;
  marketType: 'OTC';
  baseline: number;
  phaseMs: number;
  version: number;
  smoothing: SmoothingState;
  reason: string;
  target: PayoutTarget | null;
  metrics: MarketConditionMetrics | null;
};

type Listener = (update: AssetPayoutUpdate) => void;

/**
 * The asset's calibrated payout for a 60-second trade before this engine
 * existed; the risk model moves around it.
 */
export function baselinePayout(asset: MarketAsset, config: PayoutEngineConfig) {
  return clampPercent(Math.round(83 + asset.payoutBoost), config);
}

/**
 * Publishes one payout per asset from measured market conditions.
 *
 * Every evaluation interval each asset's conditions are measured and turned
 * into a target (payout-model.ts), and the target is smoothed and
 * rate-limited (payout-smoothing.ts). Published payouts are stored with a
 * version and an auditable reason, and broadcast to listeners.
 *
 * Payouts depend on market conditions and trade expiry only. The engine
 * never sees users, balances or trade results.
 */
@Injectable()
export class PayoutEngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PayoutEngine');
  private readonly runtimes = new Map<string, AssetRuntime>();
  private readonly bySymbolLower = new Map<string, AssetRuntime>();
  private readonly listeners = new Set<Listener>();
  private readonly repository: PayoutRepository;
  readonly config: PayoutEngineConfig;
  private timer: NodeJS.Timeout | null = null;
  private cycleRunning = false;
  private leaderLastCycle = false;

  constructor(
    private readonly conditions: MarketConditionService,
    @Optional() @Inject(PAYOUT_REPOSITORY) repository?: PayoutRepository,
    @Optional() @Inject(PAYOUT_ENGINE_CONFIG) config?: PayoutEngineConfig,
  ) {
    this.repository = repository ?? new NoopPayoutRepository();
    this.config = config ?? DEFAULT_PAYOUT_ENGINE_CONFIG;
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
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.listeners.clear();
    await this.repository.close().catch(() => undefined);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Loads the published payouts so they survive restarts. */
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
    } catch (error) {
      this.logger.error(
        `Could not load stored payouts; starting from baselines: ${(error as Error).message}`,
      );
    }
  }

  /** One evaluation: measure every asset, then publish what the rules allow. */
  async runCycle(now = Date.now()) {
    if (this.cycleRunning) return;
    this.cycleRunning = true;
    try {
      for (const runtime of this.runtimes.values()) {
        const metrics = this.conditions.measure(runtime.asset.symbol, now);
        runtime.metrics = metrics;
        runtime.target = computeTargetPayout(metrics, runtime.baseline, this.config);
      }

      if (!this.repository.enabled) {
        this.decideAll(now).forEach((update) => this.emit(update));
        return;
      }

      try {
        const commit = await this.repository.withLeaderLock((session) =>
          this.leaderCycle(session, now),
        );
        this.leaderLastCycle = commit !== null;
        if (commit) {
          // The transaction has committed: only now change local state.
          commit().forEach((update) => this.emit(update));
        } else {
          await this.followerSync(now);
        }
      } catch (error) {
        // Hold the current payouts; the next cycle tries again.
        this.logger.warn(`Payout cycle skipped: ${(error as Error).message}`);
      }
    } finally {
      this.cycleRunning = false;
    }
  }

  /** Authoritative quote for a trade on this asset and expiry. */
  quote(symbol: string, expirySeconds: number, now = Date.now()): PayoutQuote | null {
    const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
    if (!runtime) return null;
    const adjustment = expiryAdjustment(expirySeconds);
    return {
      symbol: runtime.asset.symbol,
      marketType: runtime.marketType,
      payoutPercent: clampPercent(runtime.smoothing.displayed + adjustment, this.config),
      assetPayoutPercent: runtime.smoothing.displayed,
      expiryAdjustmentPercent: adjustment,
      expirySeconds,
      version: runtime.version,
      quotedAt: new Date(now).toISOString(),
    };
  }

  getSnapshot(symbol: string): AssetPayoutSnapshot | null {
    const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
    return runtime ? this.toSnapshot(runtime) : null;
  }

  listSnapshots(): AssetPayoutSnapshot[] {
    return Array.from(this.runtimes.values()).map((runtime) => this.toSnapshot(runtime));
  }

  /** What the engine currently measures for an asset (for audit/admin). */
  getDiagnostics(symbol: string) {
    const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
    if (!runtime) return null;
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

  getHistory(symbol: string, limit = 50): Promise<PayoutHistoryEntry[]> {
    const runtime = this.bySymbolLower.get(symbol.trim().toLowerCase());
    if (!runtime) return Promise.resolve([]);
    return this.repository.loadHistory(runtime.asset.symbol, Math.min(Math.max(limit, 1), 200));
  }

  publicConfig() {
    return { ...this.config, expiryAdjustments: EXPIRY_ADJUSTMENTS };
  }

  private resetRuntimes(now: number) {
    this.runtimes.clear();
    this.bySymbolLower.clear();
    for (const asset of MARKET_ASSETS) {
      if (!asset.isActive) continue;
      const baseline = baselinePayout(asset, this.config);
      const runtime: AssetRuntime = {
        asset,
        marketType: 'OTC',
        baseline,
        phaseMs: reviewPhaseMs(asset.symbol, this.config),
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

  /** Memory-only mode: decide and apply every asset locally. */
  private decideAll(now: number) {
    const updates: AssetPayoutUpdate[] = [];
    for (const runtime of this.runtimes.values()) {
      const decision = decidePayout(
        runtime.smoothing,
        runtime.target?.targetPercent ?? null,
        now,
        runtime.phaseMs,
        this.config,
      );
      runtime.smoothing.smoothed = decision.smoothed;
      if (decision.reviewed) runtime.smoothing.lastReviewedAt = now;
      if (decision.next === null) continue;
      const previous = runtime.smoothing.displayed;
      runtime.smoothing = applyChange(runtime.smoothing, decision.next, now);
      runtime.version += 1;
      runtime.reason = this.reasonText(decision.reason, runtime, previous);
      updates.push(this.toUpdate(runtime, previous));
    }
    return updates;
  }

  /**
   * Leader path: reads the stored state under the lock, decides, and writes
   * changes as version compare-and-sets. Local state changes only after the
   * transaction commits (the returned updates are applied by the caller).
   */
  private async leaderCycle(session: LeaderSession, now: number) {
    const stored = await session.loadStates();
    const changes = await session.loadChangesSince(now - HOUR_MS);
    const storedSymbols = new Set(stored.map((row) => row.assetSymbol));

    const adopted = this.adoptStored(stored, changes, true);

    const missing = Array.from(this.runtimes.values()).filter(
      (runtime) => !storedSymbols.has(runtime.asset.symbol),
    );
    await session.insertMissing(
      missing.map((runtime) => ({
        assetSymbol: runtime.asset.symbol,
        marketType: runtime.marketType,
        category: runtime.asset.category,
        payoutPercent: runtime.smoothing.displayed,
        baselinePercent: runtime.baseline,
        version: runtime.version,
        lastChangedAt: runtime.smoothing.lastChangedAt,
        lastReviewedAt: runtime.smoothing.lastReviewedAt,
        reason: runtime.reason,
      })),
    );

    const published: Array<{ runtime: AssetRuntime; next: number; reason: string }> = [];
    const evaluations = [];

    for (const runtime of this.runtimes.values()) {
      const decision = decidePayout(
        runtime.smoothing,
        runtime.target?.targetPercent ?? null,
        now,
        runtime.phaseMs,
        this.config,
      );
      runtime.smoothing.smoothed = decision.smoothed;
      if (decision.reviewed) runtime.smoothing.lastReviewedAt = now;

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
        if (ok) published.push({ runtime, next: decision.next, reason });
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

    // Applied by the caller once the transaction has committed.
    return () => {
      const updates = [...adopted];
      for (const { runtime, next, reason } of published) {
        const previous = runtime.smoothing.displayed;
        runtime.smoothing = applyChange(runtime.smoothing, next, now);
        runtime.version += 1;
        runtime.reason = reason;
        updates.push(this.toUpdate(runtime, previous));
      }
      return updates;
    };
  }

  /** Follower path: adopt whatever the leader published. */
  private async followerSync(now: number) {
    const [stored, changes] = await Promise.all([
      this.repository.loadStates(),
      this.repository.loadChangesSince(now - HOUR_MS),
    ]);
    this.adoptStored(stored, changes, true).forEach((update) => this.emit(update));
  }

  /**
   * Brings local state in line with stored rows. Returns updates for assets
   * whose stored version is newer (when collect is true).
   */
  private adoptStored(stored: StoredPayoutState[], changes: PayoutHistoryEntry[], collect: boolean) {
    const changesBySymbol = new Map<string, PayoutChange[]>();
    for (const change of changes) {
      const list = changesBySymbol.get(change.assetSymbol) ?? [];
      list.push({ at: change.createdAt, delta: change.payoutPercent - (change.previousPercent ?? change.payoutPercent) });
      changesBySymbol.set(change.assetSymbol, list);
    }

    const updates: AssetPayoutUpdate[] = [];
    for (const row of stored) {
      const runtime = this.runtimes.get(row.assetSymbol);
      if (!runtime) continue;
      runtime.smoothing.changes = changesBySymbol.get(row.assetSymbol) ?? [];
      runtime.smoothing.lastReviewedAt = Math.max(runtime.smoothing.lastReviewedAt, row.lastReviewedAt);
      if (runtime.smoothing.smoothed === null && row.smoothedPercent !== null) {
        runtime.smoothing.smoothed = row.smoothedPercent;
      }
      if (row.version < runtime.version) continue;
      if (row.version === runtime.version && row.payoutPercent === runtime.smoothing.displayed) {
        runtime.smoothing.lastChangedAt = row.lastChangedAt;
        continue;
      }
      const previous = runtime.smoothing.displayed;
      runtime.smoothing.displayed = row.payoutPercent;
      runtime.smoothing.lastChangedAt = row.lastChangedAt;
      runtime.version = row.version;
      runtime.reason = 'SYNCED_FROM_STORE';
      if (collect) updates.push(this.toUpdate(runtime, previous));
    }
    return updates;
  }

  private reasonText(code: string, runtime: AssetRuntime, from: number, to = runtime.smoothing.displayed) {
    const target = runtime.target;
    const smoothed = runtime.smoothing.smoothed;
    const detail = target
      ? `target ${target.targetPercent.toFixed(2)}% (smoothed ${
          smoothed === null ? 'n/a' : smoothed.toFixed(2)
        }%, baseline ${target.baselinePercent}%): ${describeTarget(target)}`
      : 'no market target';
    return `${code} ${from}%→${to}%; ${detail}`;
  }

  private toUpdate(runtime: AssetRuntime, previous: number | null): AssetPayoutUpdate {
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

  private toSnapshot(runtime: AssetRuntime): AssetPayoutSnapshot {
    return {
      ...this.toUpdate(runtime, null),
      baselinePercent: runtime.baseline,
      targetPercent: runtime.target?.targetPercent ?? null,
    };
  }

  private emit(update: AssetPayoutUpdate) {
    for (const listener of this.listeners) {
      try {
        listener(update);
      } catch (error) {
        this.logger.warn(`Payout listener failed: ${(error as Error).message}`);
      }
    }
  }
}
