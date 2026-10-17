import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';
import { RealMarketsController } from './real-markets.controller';
import { RealMarketsService } from './real-markets.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [RealMarketsController],
  providers: [RealMarketsService],
  exports: [RealMarketsService],
})
export class RealMarketsModule {}