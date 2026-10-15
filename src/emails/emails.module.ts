import { Module } from '@nestjs/common';
import { EmailWebhooksController } from './email-webhooks.controller';
import { EmailsService } from './emails.service';

@Module({
  controllers: [EmailWebhooksController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
