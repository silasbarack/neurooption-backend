import { Module } from '@nestjs/common';
import { MarketDataModule } from '../market-data/market-data.module';
import { WalletsModule } from '../wallets/wallets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { TradesModule } from '../trades/trades.module';
import { LedgerModule } from '../ledger/ledger.module';
import { TradingEngineController } from './trading-engine.controller';
import { TradingEngineService } from './trading-engine.service';

@Module({
  imports: [
    MarketDataModule,
    WalletsModule,
    TransactionsModule,
    TradesModule,
    LedgerModule,
  ],
  controllers: [TradingEngineController],
  providers: [TradingEngineService],
  exports: [TradingEngineService],
})
export class TradingEngineModule {}