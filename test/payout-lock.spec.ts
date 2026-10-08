/// <reference types="jest" />
import { ConflictException } from '@nestjs/common';
import { MARKET_ASSETS } from '../src/market-data/market-data.constants';
import { MarketConditionService } from '../src/payout-engine/market-condition.service';
import { MarketConditionMetrics } from '../src/payout-engine/payout-model';
import { PayoutEngineService } from '../src/payout-engine/payout-engine.service';
import { TradingEngineService } from '../src/trading-engine/trading-engine.service';

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 8, 7, 0, 0);

function conditions(overrides: () => Partial<MarketConditionMetrics>) {
  return {
    measure: () => ({
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
      ...overrides(),
    }),
  } as unknown as MarketConditionService;
}

/** Trading engine wired to an in-memory trade store and real payout engine. */
function setup(payoutEngine: PayoutEngineService) {
  const trades = new Map<string, any>();
  const tradesService = {
    create: jest.fn(async (input) => {
      trades.set(input.id, { ...input });
      return { ...input };
    }),
    findById: jest.fn(async (id) => (trades.has(id) ? { ...trades.get(id) } : null)),
    update: jest.fn(async (id, patch) => {
      trades.set(id, { ...trades.get(id), ...patch });
      return { ...trades.get(id) };
    }),
  };
  let price = 100;
  const marketData = { getTick: jest.fn(() => ({ price })) };
  const wallets = {
    ensureWallet: jest.fn(async () => ({ id: 'w1' })),
    debit: jest.fn(async () => undefined),
    credit: jest.fn(async () => undefined),
    getBalance: jest.fn(async () => ({ balance: 1000 })),
  };
  const transactions = { create: jest.fn(async () => undefined) };
  const ledger = {};
  const service = new TradingEngineService(
    marketData as any,
    wallets as any,
    transactions as any,
    tradesService as any,
    ledger as any,
    payoutEngine,
  );
  return { service, trades, wallets, setPrice: (next: number) => (price = next) };
}

const order = (extra: Record<string, unknown> = {}) => ({
  userId: 'user-a',
  asset: 'BTC/USD OTC',
  timeframe: 'M1',
  side: 'BUY' as const,
  accountType: 'QT Demo' as const,
  currency: 'USD' as const,
  amount: 100,
  expirySeconds: 60,
  ...extra,
});

describe('payout locked at trade execution', () => {
  let volatile = false;
  let engine: PayoutEngineService;

  beforeEach(async () => {
    volatile = false;
    engine = new PayoutEngineService(
      conditions(() => (volatile ? { volatilityRatio: 2.5, rangeRatio: 2 } : {})),
    );
    await engine.initialize(T0);
  });

  /** Runs cycles until Bitcoin's payout changes; returns the new quote. */
  async function forcePayoutChange() {
    volatile = true;
    const before = engine.quote('BTC/USD OTC', 60)!;
    for (let t = 1; t <= 30; t += 1) {
      await engine.runCycle(T0 + t * MIN);
      const now = engine.quote('BTC/USD OTC', 60)!;
      if (now.version !== before.version) return { before, now };
    }
    throw new Error('payout never changed');
  }

  it('stores the authorised payout and version on the trade', async () => {
    const { service } = setup(engine);
    const quote = engine.quote('BTC/USD OTC', 60)!;
    const { trade } = await service.placeTrade(
      order({ quotedPayoutPercent: quote.payoutPercent, payoutVersion: quote.version }),
    );
    expect(trade.payoutPercent).toBe(quote.payoutPercent);
    expect((trade as any).payoutVersion).toBe(quote.version);
    expect(trade.expectedProfitAmount).toBeCloseTo(100 * (quote.payoutPercent / 100), 2);
  });

  it('refuses a trade whose shown payout is out of date instead of substituting', async () => {
    const { service, trades } = setup(engine);
    const { before, now } = await forcePayoutChange();
    expect(now.payoutPercent).not.toBe(before.payoutPercent);

    const attempt = service.placeTrade(order({ quotedPayoutPercent: before.payoutPercent }));
    await expect(attempt).rejects.toBeInstanceOf(ConflictException);
    await attempt.catch((error: ConflictException) => {
      const body = error.getResponse() as any;
      expect(body.code).toBe('PAYOUT_CHANGED');
      expect(body.quote.payoutPercent).toBe(now.payoutPercent);
    });
    expect(trades.size).toBe(0);
  });

  it('keeps an open trade at its accepted payout after the asset payout changes', async () => {
    const { service, trades, wallets, setPrice } = setup(engine);
    const accepted = engine.quote('BTC/USD OTC', 60)!;
    const { trade } = await service.placeTrade(order({ quotedPayoutPercent: accepted.payoutPercent }));

    const { now } = await forcePayoutChange();
    expect(now.payoutPercent).toBeLessThan(accepted.payoutPercent);

    setPrice(101); // BUY wins
    await service.settleTrade(trade.id);
    const settled = trades.get(trade.id);
    expect(settled.payoutPercent).toBe(accepted.payoutPercent);
    expect(settled.status).toBe('WON');
    expect(settled.profitAmount).toBeCloseTo(100 * (accepted.payoutPercent / 100), 2);
    expect(wallets.credit).toHaveBeenCalledWith('user-a', 'QT Demo', settled.expectedReturnUsd);
  });

  it('pays every trader the same payout for the same asset and expiry', async () => {
    const { service } = setup(engine);
    const winner = await service.placeTrade(order({ userId: 'big-winner', amount: 5000 }));
    const loser = await service.placeTrade(order({ userId: 'new-user', amount: 1 }));
    expect(winner.trade.payoutPercent).toBe(loser.trade.payoutPercent);
  });

  it('applies the expiry rule shown to the trader, independent of chart timeframe', async () => {
    const { service } = setup(engine);
    const asset = MARKET_ASSETS.find((item) => item.symbol === 'BTC/USD OTC')!;
    const s5 = await service.placeTrade(order({ timeframe: 'S5', expirySeconds: 60 }));
    const h1 = await service.placeTrade(order({ timeframe: 'H1', expirySeconds: 60 }));
    const short = await service.placeTrade(order({ expirySeconds: 10 }));
    expect(s5.trade.payoutPercent).toBe(83 + asset.payoutBoost);
    expect(h1.trade.payoutPercent).toBe(s5.trade.payoutPercent);
    expect(short.trade.payoutPercent).toBe(s5.trade.payoutPercent - 3);
  });

  it('accepts or cleanly refuses every order while payouts change underneath', async () => {
    const { service } = setup(engine);
    volatile = true;
    const results: Array<{ shown: number; stored?: number; refused?: boolean }> = [];
    for (let t = 1; t <= 40; t += 1) {
      const shown = engine.quote('BTC/USD OTC', 60)!.payoutPercent;
      // The order and the payout update race each other.
      const [placed] = await Promise.allSettled([
        service.placeTrade(order({ quotedPayoutPercent: shown })),
        engine.runCycle(T0 + t * MIN),
      ]);
      if (placed.status === 'fulfilled') results.push({ shown, stored: placed.value.trade.payoutPercent });
      else results.push({ shown, refused: placed.reason instanceof ConflictException });
    }
    for (const result of results) {
      if (result.stored !== undefined) expect(result.stored).toBe(result.shown);
      else expect(result.refused).toBe(true);
    }
  });
});
