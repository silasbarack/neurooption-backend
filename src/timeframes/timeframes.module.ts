import { Module } from '@nestjs/common';
import { TimeframesController } from './timeframes.controller';
import { TimeframesService } from './timeframes.service';

@Module({
  controllers: [TimeframesController],
  providers: [TimeframesService],
  exports: [TimeframesService],
})
export class TimeframesModule {}