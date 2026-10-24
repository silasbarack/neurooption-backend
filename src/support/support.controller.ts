import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { SupportService } from './support.service';

/** The signed-in client's own support tickets. Staff work tickets from /admin/console/support. */
@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get('tickets')
  list(@Req() req: AuthenticatedRequest) {
    return this.support.listMine(req.user.id);
  }

  @Post('tickets')
  create(@Req() req: AuthenticatedRequest, @Body() body: { subject?: string; message?: string }) {
    return this.support.create(req.user.id, body);
  }

  @Get('tickets/:id')
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.support.getMine(req.user.id, id);
  }

  @Post('tickets/:id/messages')
  reply(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { message?: string }) {
    return this.support.reply(req.user.id, id, body);
  }
}
