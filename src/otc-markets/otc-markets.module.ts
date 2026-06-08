import { Module } from '@nestjs/common';
import { OtcMarketsController } from './otc-markets.controller';
import { OtcMarketsService } from './otc-markets.service';

@Module({
  controllers: [OtcMarketsController],
  providers: [OtcMarketsService],
  exports: [OtcMarketsService],
})
export class OtcMarketsModule {}