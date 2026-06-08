import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.transactionsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, dto);
  }

  @Patch(':id/processing')
  markProcessing(@Param('id') id: string) {
    return this.transactionsService.markProcessing(id);
  }

  @Patch(':id/completed')
  markCompleted(@Param('id') id: string) {
    return this.transactionsService.markCompleted(id);
  }

  @Patch(':id/failed')
  markFailed(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.transactionsService.markFailed(id, reason);
  }

  @Patch(':id/rejected')
  markRejected(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.transactionsService.markRejected(id, reason);
  }

  @Patch(':id/cancelled')
  markCancelled(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.transactionsService.markCancelled(id, reason);
  }
}