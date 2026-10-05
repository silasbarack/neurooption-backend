import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from './authenticated-request';
import { WithdrawalRequestDto } from './dto/withdrawal-request.dto';
import { FinanceService } from './finance.service';

@Controller('finance/me')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get()
  overview(@Req() req: AuthenticatedRequest) {
    return this.finance.overview(req.user.id);
  }

  @Post('withdrawals')
  requestWithdrawal(@Req() req: AuthenticatedRequest, @Body() dto: WithdrawalRequestDto) {
    return this.finance.requestWithdrawal(req.user.id, dto.phone, dto.amount);
  }
}
