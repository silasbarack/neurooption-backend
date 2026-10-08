import { CandleAggregatorService } from '../market-data/candle-aggregator.service';
import { OtcStreamEngineService } from '../market-data/otc-stream-engine.service';
import { MarketConditionMetrics } from './payout-model';
export declare class MarketConditionService {
    private readonly candles;
    private readonly otcEngine;
    constructor(candles: CandleAggregatorService, otcEngine: OtcStreamEngineService);
    measure(symbol: string, now?: number): MarketConditionMetrics;
}
