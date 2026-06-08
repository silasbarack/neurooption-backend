import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TradingEngineService } from './trading-engine.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';

@Controller('trading-engine')
export class TradingEngineController {
  constructor(private readonly tradingEngineService: TradingEngineService) {}

  @Post(':userId/trade')
  createTrade(
    @Param('userId') userId: string,
    @Body() createTradeDto: CreateTradeDto,
  ) {
    return this.tradingEngineService.createTrade(userId, createTradeDto);
  }

  @Post('settle')
  settleTrade(@Body() settleTradeDto: SettleTradeDto) {
    return this.tradingEngineService.settleTrade(settleTradeDto);
  }

  @Get(':userId/trades')
  getUserTrades(@Param('userId') userId: string) {
    return this.tradingEngineService.getUserTrades(userId);
  }
}