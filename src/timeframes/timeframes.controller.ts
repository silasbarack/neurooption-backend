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
import { TimeframesService } from './timeframes.service';
import { CreateTimeframeDto, TimeframeCode } from './dto/create-timeframe.dto';
import { UpdateTimeframeDto } from './dto/update-timeframe.dto';
import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';

/** Internal tooling only: not used by the client app. Super Administrators only. */
@UseGuards(AdminSessionGuard, AdminSuperGuard)
@Controller('timeframes')
export class TimeframesController {
  constructor(private readonly timeframesService: TimeframesService) {}

  @Post()
  create(@Body() dto: CreateTimeframeDto) {
    return this.timeframesService.create(dto);
  }

  @Get()
  findAll() {
    return this.timeframesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.timeframesService.findActive();
  }

  @Get(':code')
  findOne(@Param('code') code: TimeframeCode) {
    return this.timeframesService.findOne(code);
  }

  @Patch(':code')
  update(
    @Param('code') code: TimeframeCode,
    @Body() dto: UpdateTimeframeDto,
  ) {
    return this.timeframesService.update(code, dto);
  }

  @Delete(':code')
  remove(@Param('code') code: TimeframeCode) {
    return this.timeframesService.remove(code);
  }
}