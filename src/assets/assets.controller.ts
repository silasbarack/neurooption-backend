import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketType } from '@prisma/client';
import { AssetsService } from './assets.service';
import { AssetsQueryDto } from './dto/assets-query.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query() query: AssetsQueryDto) {
    return this.assetsService.findAll(query);
  }

  @Get('summary')
  getSummary() {
    return this.assetsService.getSummary();
  }

  @Get('symbol/:symbol')
  findBySymbol(
    @Param('symbol') symbol: string,
    @Query('marketType') marketType?: MarketType,
  ) {
    return this.assetsService.findBySymbol(symbol, marketType);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.assetsService.findById(id);
  }
}