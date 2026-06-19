import { Module } from '@nestjs/common';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';
import { OtcEngineService } from './otc-engine.service';
import { PrismaService } from '../config/prisma.service';

@Module({
  controllers: [MarketDataController],
  providers: [MarketDataService, OtcEngineService, PrismaService],
  exports: [MarketDataService],
})
export class MarketDataModule {}