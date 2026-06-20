import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TradingEngineService } from './trading-engine.service';
import { OpenTradesDto } from './dto/open-trades.dto';
import { GetTradesDto } from './dto/get-trades.dto';

@Controller('trading')
export class TradingEngineController {
  constructor(private readonly tradingEngineService: TradingEngineService) {}

  @Get('wallet')
  getWallet(@Query() query: GetTradesDto) {
    return this.tradingEngineService.getWallet(query);
  }

  @Post('open')
  openTrade(@Body() body: OpenTradesDto) {
    return this.tradingEngineService.getOpenTrades(body);
  }

  @Get('open')
  getOpenTrades(@Query() query: GetTradesDto) {
    return this.tradingEngineService.getOpenTrades(query);
  }

  @Get('history')
  getTradeHistory(@Query() query: GetTradesDto) {
    return this.tradingEngineService.getTradeHistory(query);
  }

  @Post('settle-expired')
  settleExpiredTrades(@Query('userId') userId?: string) {
    return this.tradingEngineService.settleExpiredTrades(userId);
  }
}