import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';
import { CandlesController } from './candles.controller';
import { CandlesService } from './candles.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [CandlesController],
  providers: [CandlesService],
  exports: [CandlesService],
})
export class CandlesModule {}