import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRealSymbolDto } from './dto/create-real-symbol.dto';
import { UpdateRealSymbolDto } from './dto/update-real-symbol.dto';
import { RealMarketsService } from './real-markets.service';

@Controller('real-markets')
export class RealMarketsController {
  constructor(private readonly realMarketsService: RealMarketsService) {}

  @Post()
  create(@Body() dto: CreateRealSymbolDto) {
    return this.realMarketsService.create(dto);
  }

  @Get()
  findAll() {
    return this.realMarketsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.realMarketsService.findActive();
  }

  @Get(':symbol')
  findOne(@Param('symbol') symbol: string) {
    return this.realMarketsService.findOne(symbol);
  }

  @Patch(':symbol')
  update(
    @Param('symbol') symbol: string,
    @Body() dto: UpdateRealSymbolDto,
  ) {
    return this.realMarketsService.update(symbol, dto);
  }

  @Delete(':symbol')
  remove(@Param('symbol') symbol: string) {
    return this.realMarketsService.remove(symbol);
  }
}