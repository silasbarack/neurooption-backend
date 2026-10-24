import { Module } from '@nestjs/common';
import { EmailsModule } from '../emails/emails.module';

import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [EmailsModule],
  controllers: [
    KycController,
  ],
  providers: [
    KycService,
  ],
  exports: [
    KycService,
  ],
})
export class KycModule {}