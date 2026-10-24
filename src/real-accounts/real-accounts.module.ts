import { Module } from '@nestjs/common';

import { TradingAccountsModule } from '../trading-accounts/trading-accounts.module';
import { RealAccountsController } from './real-accounts.controller';
import { RealAccountsService } from './real-accounts.service';

@Module({
  imports: [TradingAccountsModule],
  controllers: [RealAccountsController],
  providers: [RealAccountsService],
  exports: [RealAccountsService],
})
export class RealAccountsModule {}