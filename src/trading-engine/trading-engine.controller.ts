import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TradingEngineService } from './trading-engine.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import {
  AccountCurrency,
  AccountType,
} from './trading-engine.types';

@Controller('trading-engine')
export class TradingEngineController {
  constructor(private readonly tradingEngineService: TradingEngineService) {}

  @Post('trades')
  placeTrade(@Body() dto: PlaceTradeDto) {
    return this.tradingEngineService.placeTrade(dto);
  }

  @Post('trades/:tradeId/settle')
  settleTrade(@Param('tradeId') tradeId: string) {
    return this.tradingEngineService.settleTrade(tradeId);
  }

  @Get('trades/open')
  getOpenTrades(@Query('userId') userId = 'demo-user') {
    return this.tradingEngineService.getOpenTrades(userId);
  }

  @Get('trades/history')
  getTradeHistory(@Query('userId') userId = 'demo-user') {
    return this.tradingEngineService.getTradeHistory(userId);
  }

  @Get('trades')
  getAllTrades(@Query('userId') userId = 'demo-user') {
    return this.tradingEngineService.getAllTrades(userId);
  }

  @Get('wallet')
  getWallet(
    @Query('userId') userId = 'demo-user',
    @Query('accountType') accountType: AccountType = 'QT Demo',
    @Query('currency') currency: AccountCurrency = 'USD',
  ) {
    return this.tradingEngineService.getWallet(userId, accountType, currency);
  }

  @Get('transactions')
  getTransactions(@Query('userId') userId = 'demo-user') {
    return this.tradingEngineService.getTransactions(userId);
  }
}