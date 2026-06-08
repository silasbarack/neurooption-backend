import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { PriceFeedDto } from './dto/price-feed.dto';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get()
  findAll() {
    return this.marketDataService.findAll();
  }

  @Get('symbol/:symbol')
  findBySymbol(@Param('symbol') symbol: string) {
    return this.marketDataService.findBySymbol(symbol);
  }

  @Get('market/:marketType')
  findByMarketType(@Param('marketType') marketType: 'OTC' | 'REAL') {
    return this.marketDataService.findByMarketType(marketType);
  }

  @Patch('price')
  updatePrice(@Body() dto: PriceFeedDto) {
    return this.marketDataService.updatePrice(dto);
  }
}