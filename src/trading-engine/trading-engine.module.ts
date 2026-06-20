import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { MarketDataModule } from '../market-data/market-data.module';
import { TradingEngineController } from './trading-engine.controller';
import { TradingEngineService } from './trading-engine.service';

@Module({
  imports: [MarketDataModule],
  controllers: [TradingEngineController],
  providers: [TradingEngineService, PrismaService],
  exports: [TradingEngineService],
})
export class TradingEngineModule {}