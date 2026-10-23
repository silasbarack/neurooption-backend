import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketsService } from './markets.service';

@ApiTags('Markets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all markets' })
  @ApiQuery({ name: 'category', required: false })
  getAll(@Query('category') category?: string) {
    if (category) return this.marketsService.getMarketsByCategory(category);
    return this.marketsService.getAllMarkets();
  }

  @Get('otc')
  @ApiOperation({ summary: 'Get all OTC markets' })
  getOTC() {
    return this.marketsService.getOTCMarkets();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get all live markets' })
  getLive() {
    return this.marketsService.getLiveMarkets();
  }

  @Get('ticks')
  @ApiOperation({ summary: 'Get all current price ticks' })
  getAllTicks() {
    return this.marketsService.getAllTicks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single market by ID' })
  getOne(@Param('id') id: string) {
    return this.marketsService.getMarket(id);
  }

  @Get(':id/price')
  @ApiOperation({ summary: 'Get current price for market' })
  getPrice(@Param('id') id: string) {
    return { marketId: id, price: this.marketsService.getCurrentPrice(id) };
  }

  @Get(':id/tick')
  @ApiOperation({ summary: 'Get full price tick for market' })
  getTick(@Param('id') id: string) {
    return this.marketsService.getPriceTick(id);
  }
}
