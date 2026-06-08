import { Module } from '@nestjs/common';

import { TradingAccountsModule } from '../trading-accounts/trading-accounts.module';
import { DemoAccountsController } from './demo-accounts.controller';
import { DemoAccountsService } from './demo-accounts.service';

@Module({
  imports: [TradingAccountsModule],
  controllers: [DemoAccountsController],
  providers: [DemoAccountsService],
  exports: [DemoAccountsService],
})
export class DemoAccountsModule {}