import { Module } from '@nestjs/common';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';
import { CandleAggregatorService } from './candle-aggregator.service';
import { MarketStreamService } from './market-stream.service';
import { OtcStreamEngineService } from './otc-stream-engine.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    CandleAggregatorService,
    OtcStreamEngineService,
    LatencyMetricsService,
    MarketStreamService,
  ],
  exports: [
    MarketDataService,
    CandleAggregatorService,
    MarketStreamService,
    LatencyMetricsService,
  ],
})
export class MarketDataModule {}
