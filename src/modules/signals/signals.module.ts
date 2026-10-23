import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Signal } from './signal.entity';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([Signal]), MarketDataModule],
  providers: [SignalsService],
  controllers: [SignalsController],
  exports: [SignalsService],
})
export class SignalsModule {}
