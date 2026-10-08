/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import { MARKET_ASSETS } from '../src/market-data/market-data.constants';
import { MarketConditionService } from '../src/payout-engine/market-condition.service';
import { MarketConditionMetrics } from '../src/payout-engine/payout-model';
import {
  AssetPayoutUpdate,
  PayoutEngineService,
} from '../src/payout-engine/payout-engine.service';
import { PrismaPayoutRepository } from '../src/payout-engine/payout-repository';

/**
 * Runs against a real PostgreSQL database (DATABASE_URL), like the other
 * database tests. Simulates several backend instances sharing it.
 */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 8, 7, 0, 0);

function conditions(scenario: (symbol: string) => Partial<MarketConditionMetrics>) {
  return {
    measure: (symbol: string) => ({
      source: 'OTC_SYNTHETIC_ENGINE',
      measuredAt: '',
      dataQuality: 'OK',
      s5Samples: 720,
      m1Samples: 60,
      lastTickAgeMs: 10,
      shortVolatility: 1,
      longVolatility: 1,
      volatilityRatio: 1,
      movementIntensity: 1,
      shortRangePct: 0,
      rangeRatio: 1,
      trendStrength: 0.1,
      reversalRate: 0.5,
      stressedRegimeShare: 0.3,
      trendingRegimeShare: 0.3,
      currentRegime: 'RANGE',
      liquidity: null,
      liquidityNote: '',
      ...scenario(symbol),
    }),
  } as unknown as MarketConditionService;
}

const cryptoVolatile = (symbol: string) =>
  MARKET_ASSETS.find((asset) => asset.symbol === symbol)?.category === 'Cryptocurrencies'
    ? { volatilityRatio: 2.4, rangeRatio: 1.9 }
    : {};

describeDb('payout engine with PostgreSQL', () => {
  const clients: PrismaClient[] = [];
  const instance = async () => {
    const client = new PrismaClient();
    clients.push(client);
    const engine = new PayoutEngineService(
      conditions(cryptoVolatile),
      new PrismaPayoutRepository(client),
    );
    const updates: AssetPayoutUpdate[] = [];
    engine.subscribe((update) => updates.push(update));
    await engine.initialize(T0);
    return { engine, updates };
  };

  const admin = new PrismaClient();

  beforeAll(async () => {
    await admin.assetPayoutHistory.deleteMany({});
    await admin.assetPayoutState.deleteMany({});
  });

  afterAll(async () => {
    await Promise.all(clients.map((client) => client.$disconnect()));
    await admin.$disconnect();
  });

  it('lets only one of several instances publish, and they agree', async () => {
    const a = await instance();
    const b = await instance();
    const c = await instance();

    for (let t = 1; t <= 90; t += 1) {
      const now = T0 + t * MIN;
      await Promise.all([a.engine.runCycle(now), b.engine.runCycle(now), c.engine.runCycle(now)]);
    }
    // One more round so followers pick up the last leader commit.
    for (const node of [a, b, c]) await node.engine.runCycle(T0 + 91 * MIN);

    const rows = await admin.assetPayoutState.findMany();
    expect(rows).toHaveLength(MARKET_ASSETS.filter((asset) => asset.isActive).length);

    const history = await admin.assetPayoutHistory.findMany({ orderBy: [{ assetSymbol: 'asc' }, { version: 'asc' }] });
    expect(history.length).toBeGreaterThan(0);

    for (const row of rows) {
      const own = history.filter((entry) => entry.assetSymbol === row.assetSymbol);
      // One history row per version step, no gaps or duplicates.
      expect(own.map((entry) => entry.version)).toEqual(
        Array.from({ length: row.version - 1 }, (_, index) => index + 2),
      );
      own.forEach((entry) => {
        expect(Math.abs(Number(entry.payoutPercent) - Number(entry.previousPercent))).toBeLessThanOrEqual(2);
        expect(entry.reason.length).toBeGreaterThan(10);
        expect(entry.riskMetrics).toBeTruthy();
      });
      for (const node of [a, b, c]) {
        const snapshot = node.engine.getSnapshot(row.assetSymbol)!;
        expect(snapshot.version).toBe(row.version);
        expect(snapshot.payoutPercent).toBe(Number(row.payoutPercent));
      }
    }

    // Every instance told its own clients about every published change.
    const changedSymbols = new Set(history.map((entry) => entry.assetSymbol));
    for (const node of [a, b, c]) {
      for (const symbol of changedSymbols) {
        const last = rows.find((row) => row.assetSymbol === symbol)!;
        const seen = node.updates.filter((update) => update.symbol === symbol);
        expect(seen[seen.length - 1].version).toBe(last.version);
      }
    }
  });

  it('restores published payouts after a restart', async () => {
    const restarted = await instance();
    const rows = await admin.assetPayoutState.findMany();
    for (const row of rows) {
      const snapshot = restarted.engine.getSnapshot(row.assetSymbol)!;
      expect(snapshot.payoutPercent).toBe(Number(row.payoutPercent));
      expect(snapshot.version).toBe(row.version);
    }
    // A restart does not reset the rolling-hour budget or the hold: the
    // first cycle afterwards publishes nothing that breaks the limits.
    await restarted.engine.runCycle(T0 + 92 * MIN);
    const recent = await admin.assetPayoutHistory.findMany({
      where: { createdAt: { gt: new Date(T0 + 32 * MIN) } },
    });
    const bySymbol = new Map<string, number>();
    for (const entry of recent) {
      bySymbol.set(
        entry.assetSymbol,
        (bySymbol.get(entry.assetSymbol) ?? 0) + Math.abs(Number(entry.payoutPercent) - Number(entry.previousPercent)),
      );
    }
    for (const total of bySymbol.values()) expect(total).toBeLessThanOrEqual(6);
  });
});
