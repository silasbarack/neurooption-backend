import { Module } from '@nestjs/common';

import { SocialTradingController } from './social-trading.controller';
import { SocialTradingService } from './social-trading.service';

@Module({
  controllers: [SocialTradingController],
  providers: [SocialTradingService],
  exports: [SocialTradingService],
})
export class SocialTradingModule {}