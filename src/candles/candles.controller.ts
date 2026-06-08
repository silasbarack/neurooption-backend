import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CandlesService } from './candles.service';
import { CreateCandleDto } from './dto/create-candle.dto';
import { CandleQueryDto } from './dto/candle-query.dto';

@Controller('candles')
export class CandlesController {
  constructor(private readonly candlesService: CandlesService) {}

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