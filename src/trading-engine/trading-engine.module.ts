import { Module } from '@nestjs/common';
import { TradingEngineController } from './trading-engine.controller';
import { TradingEngineService } from './trading-engine.service';

@Module({
  controllers: [TradingEngineController],
  providers: [TradingEngineService],
  exports: [TradingEngineService],
})
export class TradingEngineModule {}