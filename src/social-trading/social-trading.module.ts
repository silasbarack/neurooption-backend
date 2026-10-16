import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';

import { SocialTradingController } from './social-trading.controller';
import { SocialTradingService } from './social-trading.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [SocialTradingController],
  providers: [SocialTradingService],
  exports: [SocialTradingService],
})
export class SocialTradingModule {}