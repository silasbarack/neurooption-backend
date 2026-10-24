import { Module } from '@nestjs/common';

import { EmailsModule } from '../emails/emails.module';
import { LedgerModule } from '../ledger/ledger.module';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

@Module({
  imports: [LedgerModule, EmailsModule],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}