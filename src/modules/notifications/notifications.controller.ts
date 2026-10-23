import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
@ApiTags('notifications') @Controller('notifications') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
export class NotificationsController {
  constructor(private ns: NotificationsService) {}
  @Get() get(@Request() req) { return this.ns.getForUser(req.user.id); }
  @Patch(':id/read') read(@Request() req, @Param('id') id: string) { return this.ns.markRead(req.user.id, +id); }
}
