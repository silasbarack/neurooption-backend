import { Injectable } from '@nestjs/common';
import { CandleAggregatorService } from '../market-data/candle-aggregator.service';
import { OtcStreamEngineService } from '../market-data/otc-stream-engine.service';
import { MarketConditionMetrics, measureMarketConditions } from './payout-model';

/**
 * Reads market conditions for one asset from the live price pipeline: the
 * 5-second and 1-minute candles the stream really built, and how the OTC
 * generator really spent its time across regimes. Nothing here generates or
 * alters prices.
 */
@Injectable()
export class MarketConditionService {
  constructor(
    private readonly candles: CandleAggregatorService,
    private readonly otcEngine: OtcStreamEngineService,
  ) {}

  measure(symbol: string, now = Date.now()): MarketConditionMetrics {
    const closed = (timeframe: 'S5' | 'M1', limit: number) =>
      this.candles
        .getRecentCandles(symbol, timeframe, limit + 1)
        .filter((candle) => candle.closed);

    return measureMarketConditions({
      s5: closed('S5', 720),
      m1: closed('M1', 60),
      regime: this.otcEngine.drainRegimeStats(symbol),
      now,
      lastTickAt: this.candles.getLastTickTime(symbol),
      source: 'OTC_SYNTHETIC_ENGINE',
    });
  }
}
