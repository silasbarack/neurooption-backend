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

import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { WithdrawalsService } from './withdrawals.service';

// Money admin endpoints: signed-in admins only. Users manage their own
// money through /finance/me and /payments/stk.
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly service: WithdrawalsService) {}

  @Post()
  create(@Body() dto: CreateWithdrawalDto) {
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
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('externalRef') externalRef?: string,
  ) {
    return this.service.approve(id, externalRef);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.service.reject(id, rejectionReason);
  }
}