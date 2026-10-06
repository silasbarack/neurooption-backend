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
