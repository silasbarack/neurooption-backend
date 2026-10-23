import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketDataService } from './market-data.service';

@ApiTags('market-data')
@Controller('market')
export class MarketDataController {
  constructor(private marketDataService: MarketDataService) {}

  @Get('assets') getAssets() { return this.marketDataService.getAllAssets(); }
  @Get('assets/:id') getAsset(@Param('id') id: string) { return this.marketDataService.getAsset(id); }
  @Get('prices') getPrices() { return this.marketDataService.getAllPrices(); }
  @Get('prices/:id') getPrice(@Param('id') id: string) { return { assetId: id, price: this.marketDataService.getCurrentPrice(id), timestamp: Date.now() }; }
  @Get('ohlc/:id') getOHLC(@Param('id') id: string, @Query('bars') bars = 120) { return this.marketDataService.generateOHLC(id, +bars); }
}
