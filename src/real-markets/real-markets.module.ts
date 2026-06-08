import { Module } from '@nestjs/common';
import { RealMarketsController } from './real-markets.controller';
import { RealMarketsService } from './real-markets.service';

@Module({
  controllers: [RealMarketsController],
  providers: [RealMarketsService],
  exports: [RealMarketsService],
})
export class RealMarketsModule {}