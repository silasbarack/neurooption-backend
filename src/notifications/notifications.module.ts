import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';

import { PrismaService } from '../common/prisma.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}