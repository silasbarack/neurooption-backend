import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailOutboxService } from './email-outbox.service';

@Module({
  providers: [EmailsService, EmailOutboxService],
  exports: [EmailsService, EmailOutboxService],
})
export class EmailsModule {}
