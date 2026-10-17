import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';
import { NotificationsService } from './notifications.service';

/** Internal tooling only: not used by the client app. Super Administrators only. */
@UseGuards(AdminSessionGuard, AdminSuperGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/sent')
  markAsSent(@Param('id') id: string) {
    return this.notificationsService.markAsSent(id);
  }

  @Patch(':id/failed')
  markAsFailed(@Param('id') id: string) {
    return this.notificationsService.markAsFailed(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationStatusDto,
  ) {
    return this.notificationsService.updateStatus(id, dto);
  }
}