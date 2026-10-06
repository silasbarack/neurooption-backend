import { Test } from '@nestjs/testing';
import { MarketDataModule } from '../src/market-data/market-data.module';
import { MarketDataService } from '../src/market-data/market-data.service';
import { CandleAggregatorService } from '../src/market-data/candle-aggregator.service';
import {
  TIMEFRAME_MS,
  timeframeBucketStart,
} from '../src/market-data/timeframe.config';
import { OtcStreamEngineService } from '../src/market-data/otc-stream-engine.service';

describe('real-time market data', () => {
  it('boots the market-data Nest module and exposes the shared stream', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MarketDataModule],
    }).compile();

    await moduleRef.init();
    const marketData = moduleRef.get(MarketDataService);
    const tick = marketData.getTick('EUR/USD OTC');

    expect(tick).toMatchObject({
      asset: 'EUR/USD OTC',
      marketType: 'OTC',
      source: 'neurooption-otc-simulator-v2',
    });
    expect(Number(tick.price)).toBeGreaterThan(0);

    await moduleRef.close();
  });

  it('uses canonical aligned timeframe buckets including D1', () => {
    const timestamp = Date.UTC(2026, 9, 6, 10, 15, 17, 987);

    expect(timeframeBucketStart(timestamp, 'S5') % TIMEFRAME_MS.S5).toBe(0);
    expect(timeframeBucketStart(timestamp, 'M1') % TIMEFRAME_MS.M1).toBe(0);
    expect(timeframeBucketStart(timestamp, 'D1') % TIMEFRAME_MS.D1).toBe(0);
  });

  it('derives OHLC strictly from ordered ticks and rolls candles', () => {
    const aggregator = new CandleAggregatorService();
    const base = timeframeBucketStart(Date.now(), 'S5');

    const tick = (mid: number, timestamp: number, sequence: number) => ({
      symbol: 'EUR/USD OTC',
      bid: mid - 0.00001,
      ask: mid + 0.00001,
      mid,
      timestamp,
      sequence,
      source: 'test',
      marketType: 'OTC' as const,
      serverReceiveTimestamp: timestamp,
    });

    aggregator.applyTick(tick(1.1, base + 100, 1));
    aggregator.applyTick(tick(1.1008, base + 200, 2));
    aggregator.applyTick(tick(1.0994, base + 300, 3));
    aggregator.applyTick(tick(1.1002, base + 400, 4));

    expect(aggregator.getCurrentCandle('EUR/USD OTC', 'S5')).toMatchObject({
      time: base,
      open: 1.1,
      high: 1.1008,
      low: 1.0994,
      close: 1.1002,
      volume: 4,
      firstSequence: 1,
      lastSequence: 4,
    });

    aggregator.applyTick(tick(1.1005, base + TIMEFRAME_MS.S5 + 10, 5));
    const recent = aggregator.getRecentCandles('EUR/USD OTC', 'S5', 2);

    expect(recent).toHaveLength(2);
    expect(recent[0].closed).toBe(true);
    expect(recent[1]).toMatchObject({
      open: 1.1005,
      high: 1.1005,
      low: 1.1005,
      close: 1.1005,
      closed: false,
    });
  });

  it('rejects duplicate and stale ticks without overwriting close', () => {
    const aggregator = new CandleAggregatorService();
    const base = timeframeBucketStart(Date.now(), 'M1');

    const makeTick = (mid: number, timestamp: number, sequence: number) => ({
      symbol: 'GBP/USD OTC',
      bid: mid - 0.00001,
      ask: mid + 0.00001,
      mid,
      timestamp,
      sequence,
      source: 'test',
      marketType: 'OTC' as const,
      serverReceiveTimestamp: timestamp,
    });

    aggregator.applyTick(makeTick(1.25, base + 2_000, 10));
    const duplicate = aggregator.applyTick(makeTick(1.3, base + 2_100, 10));
    const stale = aggregator.applyTick(makeTick(1.2, base, 11));

    expect(duplicate.duplicate).toBe(true);
    expect(stale.outOfOrder).toBe(true);
    expect(
      aggregator.getCurrentCandle('GBP/USD OTC', 'M1')?.close,
    ).toBe(1.25);
  });

  it('lets delayed in-tolerance ticks affect range without replacing the newer close', () => {
    const aggregator = new CandleAggregatorService();
    const base = timeframeBucketStart(Date.now(), 'M1');
    const makeTick = (mid: number, timestamp: number, sequence: number) => ({
      symbol: 'EUR/USD OTC',
      bid: mid - 0.00001,
      ask: mid + 0.00001,
      mid,
      timestamp,
      sequence,
      source: 'test',
      marketType: 'OTC' as const,
      serverReceiveTimestamp: Math.max(timestamp, base + 3_000),
    });

    aggregator.applyTick(makeTick(1.1, base + 3_000, 1));
    aggregator.applyTick(makeTick(1.099, base + 2_500, 2));

    expect(aggregator.getCurrentCandle('EUR/USD OTC', 'M1')).toMatchObject({
      low: 1.099,
      close: 1.1,
      lastSequence: 2,
    });
  });

  it('reports sequence gaps', () => {
    const aggregator = new CandleAggregatorService();
    const base = timeframeBucketStart(Date.now(), 'S5');
    const makeTick = (sequence: number) => ({
      symbol: 'USD/JPY OTC',
      bid: 150.001,
      ask: 150.003,
      mid: 150.002,
      timestamp: base + sequence,
      sequence,
      source: 'test',
      marketType: 'OTC' as const,
      serverReceiveTimestamp: base + sequence,
    });

    aggregator.applyTick(makeTick(1));
    expect(aggregator.applyTick(makeTick(4)).sequenceGap).toBe(2);
  });

  it('keeps sustained EUR/USD OTC movement bounded and free of giant single-tick jumps', () => {
    const engine = new OtcStreamEngineService();
    const start = Date.UTC(2026, 9, 6, 10, 0, 0);
    const prices: number[] = [];
    let previous = engine.nextTick('EUR/USD OTC', start).mid;
    prices.push(previous);

    for (let index = 1; index <= 18_000; index += 1) {
      const tick = engine.nextTick('EUR/USD OTC', start + index * 100);
      const relativeMove = Math.abs(tick.mid - previous) / previous;

      expect(relativeMove).toBeLessThan(0.0002);
      prices.push(tick.mid);
      previous = tick.mid;
    }

    const first = prices[0];
    const last = prices[prices.length - 1];
    expect(Math.abs(last - first) / first).toBeLessThan(0.03);
  });

  it('produces frequent bounded visible EUR/USD micro-movements', () => {
    const engine = new OtcStreamEngineService();
    const aggregator = new CandleAggregatorService();
    const start = timeframeBucketStart(Date.UTC(2026, 9, 6, 10, 0, 0), 'M1');
    const ticks = Array.from({ length: 100 }, (_, index) =>
      engine.nextTick('EUR/USD OTC', start + index * 100),
    );

    const distinct = new Set(ticks.map((tick) => tick.mid));
    let adjacentChanges = 0;
    let maxRelativeMove = 0;

    ticks.forEach((tick, index) => {
      aggregator.applyTick({
        ...tick,
        serverReceiveTimestamp: tick.timestamp,
      });

      if (index === 0) return;
      if (tick.mid !== ticks[index - 1].mid) adjacentChanges += 1;
      maxRelativeMove = Math.max(
        maxRelativeMove,
        Math.abs(tick.mid - ticks[index - 1].mid) /
          Math.max(ticks[index - 1].mid, 1e-9),
      );
    });

    // The quote retraces, so it revisits levels: fewer distinct prices than
    // a random walk, but the price changes on most ticks.
    expect(distinct.size).toBeGreaterThanOrEqual(12);
    expect(adjacentChanges).toBeGreaterThanOrEqual(65);
    expect(maxRelativeMove).toBeLessThan(0.0002);

    const candle = aggregator.getCurrentCandle('EUR/USD OTC', 'M1');
    expect(candle).toBeDefined();
    expect(candle?.volume).toBe(100);
    expect(candle?.high).toBeGreaterThanOrEqual(
      Math.max(candle?.open ?? 0, candle?.close ?? 0),
    );
    expect(candle?.low).toBeLessThanOrEqual(
      Math.min(candle?.open ?? Infinity, candle?.close ?? Infinity),
    );
    expect((candle?.high ?? 0) - (candle?.low ?? 0)).toBeGreaterThan(0);
  });

  it('quotes EUR/USD in mostly small tick steps that retrace instead of trending', () => {
    const engine = new OtcStreamEngineService();
    const start = Date.UTC(2026, 9, 6, 10, 0, 0);
    const tickSize = 0.00001;
    const counts = { still: 0, one: 0, two: 0, threeToFive: 0, larger: 0 };
    const minuteRanges: number[] = [];
    let minuteHigh = -Infinity;
    let minuteLow = Infinity;
    let previous = engine.nextTick('EUR/USD OTC', start).mid;
    const total = 36_000; // one hour at 100 ms

    for (let index = 1; index <= total; index += 1) {
      const mid = engine.nextTick('EUR/USD OTC', start + index * 100).mid;
      const step = Math.round(Math.abs(mid - previous) / tickSize);
      if (step === 0) counts.still += 1;
      else if (step === 1) counts.one += 1;
      else if (step === 2) counts.two += 1;
      else if (step <= 5) counts.threeToFive += 1;
      else counts.larger += 1;
      previous = mid;

      minuteHigh = Math.max(minuteHigh, mid);
      minuteLow = Math.min(minuteLow, mid);
      if (index % 600 === 0) {
        minuteRanges.push(Math.round((minuteHigh - minuteLow) / tickSize));
        minuteHigh = -Infinity;
        minuteLow = Infinity;
      }
    }

    const share = (count: number) => count / total;
    expect(share(counts.still)).toBeGreaterThan(0.05);
    expect(share(counts.still)).toBeLessThan(0.3);
    expect(share(counts.one)).toBeGreaterThan(0.4);
    expect(share(counts.two)).toBeGreaterThan(0.12);
    expect(share(counts.two)).toBeLessThan(0.35);
    expect(share(counts.threeToFive)).toBeGreaterThan(0.02);
    expect(share(counts.threeToFive)).toBeLessThan(0.15);
    expect(share(counts.larger)).toBeLessThan(0.03);

    // Extra short-horizon jitter must not turn into giant one-minute candles.
    const sorted = [...minuteRanges].sort((a, b) => a - b);
    expect(sorted[Math.floor(sorted.length / 2)]).toBeLessThan(120);
  });

  it('anchors generated history to the oldest live candle without a visible seam', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MarketDataModule],
    }).compile();

    await moduleRef.init();

    const marketData = moduleRef.get(MarketDataService);
    const aggregator = moduleRef.get(CandleAggregatorService);
    const live = aggregator.getRecentCandles('EUR/USD OTC', 'M2', 10);
    const result = marketData.getCandles({
      asset: 'EUR/USD OTC',
      timeframe: 'M2',
      limit: 180,
    });
    const firstLive = live[0];

    expect(firstLive).toBeDefined();

    const liveIndex = result.candles.findIndex(
      (candle) => candle.time === firstLive.time,
    );

    expect(liveIndex).toBeGreaterThan(0);

    const previous = result.candles[liveIndex - 1];
    const gap = Math.abs(firstLive.open - previous.close) / firstLive.open;

    expect(gap).toBeLessThan(0.001);

    await moduleRef.close();
  });

  it('generates stateful OTC bid/ask ticks with valid precision and sequence', () => {
    const engine = new OtcStreamEngineService();
    const start = Date.now();
    const ticks = Array.from({ length: 300 }, (_, index) =>
      engine.nextTick('EUR/USD OTC', start + index * 100),
    );

    expect(ticks.every((tick) => tick.ask > tick.bid)).toBe(true);
    expect(ticks.every((tick) => tick.mid > 0)).toBe(true);
    expect(ticks.map((tick) => tick.sequence)).toEqual(
      Array.from({ length: 300 }, (_, index) => index + 1),
    );

    const uniquePrices = new Set(ticks.map((tick) => tick.mid));
    expect(uniquePrices.size).toBeGreaterThan(10);

    for (const tick of ticks) {
      expect(Number(tick.mid.toFixed(5))).toBe(tick.mid);
    }
  });
});
