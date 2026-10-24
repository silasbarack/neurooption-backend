import { Module } from '@nestjs/common';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';
import { CandleAggregatorService } from './candle-aggregator.service';
import { MarketStreamService } from './market-stream.service';
import { OtcStreamEngineService } from './otc-stream-engine.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { MarketConditionService } from '../payout-engine/market-condition.service';
import {
  PAYOUT_ENGINE_CONFIG,
  PAYOUT_REPOSITORY,
  PayoutEngineService,
} from '../payout-engine/payout-engine.service';
import { createPayoutRepository } from '../payout-engine/payout-repository';
import { loadPayoutEngineConfig } from '../payout-engine/payout-engine.config';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    CandleAggregatorService,
    OtcStreamEngineService,
    LatencyMetricsService,
    MarketStreamService,
    MarketConditionService,
    { provide: PAYOUT_REPOSITORY, useFactory: createPayoutRepository },
    { provide: PAYOUT_ENGINE_CONFIG, useFactory: loadPayoutEngineConfig },
    PayoutEngineService,
  ],
  exports: [
    MarketDataService,
    CandleAggregatorService,
    MarketStreamService,
    LatencyMetricsService,
    PayoutEngineService,
  ],
})
export class MarketDataModule {}
