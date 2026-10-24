import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';
import { OtcMarketsController } from './otc-markets.controller';
import { OtcMarketsService } from './otc-markets.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [OtcMarketsController],
  providers: [OtcMarketsService],
  exports: [OtcMarketsService],
})
export class OtcMarketsModule {}