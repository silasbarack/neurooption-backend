import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';

import { PaymentGatewaysController } from './payment-gateways.controller';
import { PaymentGatewaysService } from './payment-gateways.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [PaymentGatewaysController],
  providers: [PaymentGatewaysService],
  exports: [PaymentGatewaysService],
})
export class PaymentGatewaysModule {}