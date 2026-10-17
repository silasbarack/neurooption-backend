import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountCurrency } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { DemoAccountsService } from './demo-accounts.service';

/** Signed-in clients can only reach their own demo account. */
@Controller('demo-accounts')
@UseGuards(JwtAuthGuard)
export class DemoAccountsController {
  constructor(private readonly service: DemoAccountsService) {}

  private assertSelf(req: AuthenticatedRequest, userId: string) {
    if (req.user?.id !== userId) throw new ForbiddenException('You can only access your own account.');
  }

  @Post(':userId')
  create(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body('currency') currency?: AccountCurrency,
  ) {
    this.assertSelf(req, userId);
    return this.service.create(userId, currency);
  }

  @Get('user/:userId')
  findByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    this.assertSelf(req, userId);
    return this.service.findByUser(userId);
  }

  @Patch('user/:userId/switch-currency')
  switchCurrency(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() dto: SwitchAccountCurrencyDto,
  ) {
    this.assertSelf(req, userId);
    return this.service.switchCurrency(userId, dto);
  }

  @Patch(':accountId/reset')
  async reset(@Req() req: AuthenticatedRequest, @Param('accountId') accountId: string) {
    await this.service.assertOwnedBy(accountId, req.user.id);
    return this.service.reset(accountId);
  }
}
