import { Module } from '@nestjs/common';

import { LedgerModule } from '../ledger/ledger.module';
import { EmailsModule } from '../emails/emails.module';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

@Module({
  imports: [LedgerModule, EmailsModule],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}