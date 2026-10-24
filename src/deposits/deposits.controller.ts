import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositsService } from './deposits.service';

// Money admin endpoints: signed-in admins only. Users manage their own
// money through /finance/me and /payments/stk.
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('deposits')
export class DepositsController {
  constructor(private readonly service: DepositsService) {}

  @Post()
  create(@Body() dto: CreateDepositDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDepositStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/completed')
  markCompleted(
    @Param('id') id: string,
    @Body('externalRef') externalRef?: string,
  ) {
    return this.service.markCompleted(id, externalRef);
  }

  @Patch(':id/failed')
  markFailed(
    @Param('id') id: string,
    @Body('externalRef') externalRef?: string,
  ) {
    return this.service.markFailed(id, externalRef);
  }
}