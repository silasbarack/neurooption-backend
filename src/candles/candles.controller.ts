import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CandlesService } from './candles.service';
import { CreateCandleDto } from './dto/create-candle.dto';
import { CandleQueryDto } from './dto/candle-query.dto';
import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';

@Controller('candles')
export class CandlesController {
  constructor(private readonly candlesService: CandlesService) {}

  /** Writing candles is internal tooling: Super Administrators only. */
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Post()
  create(@Body() dto: CreateCandleDto) {
    return this.candlesService.create(dto);
  }

  @Get()
  findAll() {
    return this.candlesService.findAll();
  }

  @Get('query')
  findByQuery(@Query() query: CandleQueryDto) {
    return this.candlesService.findByQuery(query);
  }

  @Get('heiken-ashi')
  generateHeikenAshi(
    @Query('symbol') symbol: string,
    @Query('timeframe') timeframe: string,
  ) {
    return this.candlesService.generateHeikenAshi(symbol, timeframe);
  }
}