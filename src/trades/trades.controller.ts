import { Controller, ForbiddenException, Get, NotFoundException, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query() query: TradeQueryDto) {
    return this.tradesService.findAll(query);
  }

  @Get('user/:userId')
  findByUser(@Req() req: { user: { id: string; role: string } }, @Param('userId') userId: string) {
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only view your own trades.');
    }
    return this.tradesService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Req() req: { user: { id: string; role: string } }, @Param('id') id: string) {
    const trade = await this.tradesService.findOne(id);
    if (!trade || (trade.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      throw new NotFoundException('Trade not found.');
    }
    return trade;
  }
}
