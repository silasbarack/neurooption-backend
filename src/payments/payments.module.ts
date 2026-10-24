import { Module } from '@nestjs/common';

import { DepositsModule } from '../deposits/deposits.module';
import { WithdrawalsModule } from '../withdrawals/withdrawals.module';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';

@Module({
  imports: [DepositsModule, WithdrawalsModule],
  controllers: [MpesaController, FinanceController],
  providers: [MpesaService, FinanceService],
})
export class PaymentsModule {}
