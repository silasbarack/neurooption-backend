import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TradingService } from './trading.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@ApiTags('trading')
@Controller('trades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Post() place(@Request() req, @Body() dto: CreateTradeDto) { return this.tradingService.placeTrade(req.user.id, dto); }
  @Get('open') getOpen(@Request() req) { return this.tradingService.getOpenTrades(req.user.id); }
  @Get('history') getHistory(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) { return this.tradingService.getTradeHistory(req.user.id, +page, +limit); }
  @Get('stats') getStats(@Request() req) { return this.tradingService.getStats(req.user.id); }
}
