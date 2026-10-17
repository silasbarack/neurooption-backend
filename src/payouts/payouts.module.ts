import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';

import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}