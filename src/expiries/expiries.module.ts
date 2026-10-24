import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';
import { ExpiriesController } from './expiries.controller';
import { ExpiriesService } from './expiries.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [ExpiriesController],
  providers: [ExpiriesService],
  exports: [ExpiriesService],
})
export class ExpiriesModule {}