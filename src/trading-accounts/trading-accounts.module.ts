import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';

import { TradingAccountsController } from './trading-accounts.controller';
import { TradingAccountsService } from './trading-accounts.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [TradingAccountsController],
  providers: [TradingAccountsService],
  exports: [TradingAccountsService],
})
export class TradingAccountsModule {}