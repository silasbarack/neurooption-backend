import { Module } from '@nestjs/common';

import { WalletsModule } from '../wallets/wallets.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [WalletsModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
