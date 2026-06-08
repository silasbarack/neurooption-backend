import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@Body() dto: CreateTradeDto) {
    return this.tradesService.create(dto);
  }

  @Get()
  findAll(@Query() query: TradeQueryDto) {
    return this.tradesService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.tradesService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tradesService.findOne(id);
  }

  @Patch(':id/settle')
  settle(
    @Param('id') id: string,
    @Body() dto: SettleTradeDto,
  ) {
    return this.tradesService.settle(id, dto);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.tradesService.cancel(id, reason);
  }
}