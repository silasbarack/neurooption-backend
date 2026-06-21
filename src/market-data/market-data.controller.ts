import { Controller, Get, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketTickQueryDto } from './dto/market-tick-query.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('assets')
  getAssets() {
    return this.marketDataService.getAssets();
  }

  @Get('candles')
  getCandles(@Query() query: MarketCandlesQueryDto) {
    return this.marketDataService.getCandles(query);
  }

  @Get('tick')
  getTick(@Query() query: MarketTickQueryDto) {
    return this.marketDataService.getTick(query.asset);
  }
}