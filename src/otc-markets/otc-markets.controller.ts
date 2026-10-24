import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateOtcSymbolDto } from './dto/create-otc-symbol.dto';
import { UpdateOtcSymbolDto } from './dto/update-otc-symbol.dto';
import { OtcMarketsService } from './otc-markets.service';
import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';

/** Internal tooling only: not used by the client app. Super Administrators only. */
@UseGuards(AdminSessionGuard, AdminSuperGuard)
@Controller('otc-markets')
export class OtcMarketsController {
  constructor(private readonly otcMarketsService: OtcMarketsService) {}

  @Post()
  create(@Body() dto: CreateOtcSymbolDto) {
    return this.otcMarketsService.create(dto);
  }

  @Get()
  findAll() {
    return this.otcMarketsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.otcMarketsService.findActive();
  }

  @Get(':symbol')
  findOne(@Param('symbol') symbol: string) {
    return this.otcMarketsService.findOne(symbol);
  }

  @Patch(':symbol')
  update(
    @Param('symbol') symbol: string,
    @Body() dto: UpdateOtcSymbolDto,
  ) {
    return this.otcMarketsService.update(symbol, dto);
  }

  @Delete(':symbol')
  remove(@Param('symbol') symbol: string) {
    return this.otcMarketsService.remove(symbol);
  }
}