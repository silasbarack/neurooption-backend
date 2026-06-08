import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CalculatePayoutDto } from './dto/calculate-payout.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdateAssetPayoutDto } from './dto/update-asset-payout.dto';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('calculate')
  calculateExpectedPayout(@Body() dto: CalculatePayoutDto) {
    return this.payoutsService.calculateExpectedPayout(dto);
  }

  @Patch('asset-rate')
  updateAssetPayout(@Body() dto: UpdateAssetPayoutDto) {
    return this.payoutsService.updateAssetPayout(dto);
  }

  @Post()
  create(@Body() dto: CreatePayoutDto) {
    return this.payoutsService.create(dto);
  }

  @Get()
  findAll() {
    return this.payoutsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.payoutsService.findByUser(userId);
  }

  @Get('trade/:tradeId')
  findByTrade(@Param('tradeId') tradeId: string) {
    return this.payoutsService.findByTrade(tradeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payoutsService.findOne(id);
  }
}