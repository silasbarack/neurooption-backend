import { Module } from '@nestjs/common';

import { PrismaService } from '../common/prisma.service';
import { EmailsModule } from '../emails/emails.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [EmailsModule, NotificationsModule],
  controllers: [WalletsController],
  providers: [WalletsService, PrismaService],
  exports: [WalletsService],
})
export class WalletsModule {}