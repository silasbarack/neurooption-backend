import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Trade } from './trade.entity';
import { TradingService } from './trading.service';
import { TradingController } from './trading.controller';
import { UsersModule } from '../users/users.module';
import { MarketDataModule } from '../market-data/market-data.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trade]), EventEmitterModule.forRoot(), UsersModule, MarketDataModule, AuditModule],
  providers: [TradingService],
  controllers: [TradingController],
  exports: [TradingService],
})
export class TradingModule {}
