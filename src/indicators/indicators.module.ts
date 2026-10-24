import { Module } from '@nestjs/common';
import { CandlesModule } from '../candles/candles.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { IndicatorsCalculatorService } from './indicators-calculator.service';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';

@Module({
  imports: [CandlesModule, MarketDataModule],
  controllers: [IndicatorsController],
  providers: [IndicatorsService, IndicatorsCalculatorService],
  exports: [IndicatorsService, IndicatorsCalculatorService],
})
export class IndicatorsModule {}