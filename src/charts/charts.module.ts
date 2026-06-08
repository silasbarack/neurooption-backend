import { Module } from '@nestjs/common';
import { CandlesModule } from '../candles/candles.module';
import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';

@Module({
  imports: [CandlesModule],
  controllers: [ChartsController],
  providers: [ChartsService],
  exports: [ChartsService],
})
export class ChartsModule {}