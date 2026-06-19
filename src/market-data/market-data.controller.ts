import { Controller, Get, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { GetCandlesDto } from './dto/get-candles.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('assets')
  getAssets() {
    return this.marketDataService.getAssets();
  }

  @Get('candles')
  getCandles(@Query() query: GetCandlesDto) {
    return this.marketDataService.getCandles(query);
  }
}