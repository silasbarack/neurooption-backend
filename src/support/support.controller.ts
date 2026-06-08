import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SupportService } from './support.service';

import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

@Controller('support')
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
  ) {}

  @Post('ticket')
  createTicket(
    @Body()
    dto: CreateSupportTicketDto,
  ) {
    return this.supportService.createTicket(
      dto,
    );
  }

  @Get('tickets')
  getTickets() {
    return this.supportService.getTickets();
  }

  @Get('ticket/:id')
  getTicket(
    @Param('id') id: string,
  ) {
    return this.supportService.getTicket(id);
  }

  @Get('user/:userId')
  getUserTickets(
    @Param('userId') userId: string,
  ) {
    return this.supportService.getUserTickets(
      userId,
    );
  }

  @Post('message')
  sendMessage(
    @Body()
    dto: CreateSupportMessageDto,
  ) {
    return this.supportService.sendMessage(
      dto,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    dto: UpdateSupportTicketStatusDto,
  ) {
    return this.supportService.updateStatus(
      id,
      dto,
    );
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
  ) {
    return this.supportService.resolveTicket(
      id,
    );
  }

  @Patch(':id/close')
  close(
    @Param('id') id: string,
  ) {
    return this.supportService.closeTicket(
      id,
    );
  }
}