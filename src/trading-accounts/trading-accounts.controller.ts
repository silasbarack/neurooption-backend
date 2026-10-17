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
import { AccountType } from '@prisma/client';

import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';
import { TradingAccountsService } from './trading-accounts.service';

/**
 * Clients may only read their own accounts (GET user/:userId). Everything else
 * is internal tooling and needs a Super Administrator session.
 */
@Controller('trading-accounts')
export class TradingAccountsController {
  constructor(private readonly service: TradingAccountsService) {}

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Post()
  create(@Body() dto: CreateTradingAccountDto) {
    return this.service.create(dto);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Post('default/:userId')
  createDefaultAccounts(@Param('userId') userId: string) {
    return this.service.createDefaultAccounts(userId);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    if (req.user?.id !== userId) throw new ForbiddenException('You can only access your own account.');
    return this.service.findByUser(userId);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Get('user/:userId/type/:type')
  findByUserAndType(
    @Param('userId') userId: string,
    @Param('type') type: AccountType,
  ) {
    return this.service.findByUserAndType(userId, type);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTradingAccountDto,
  ) {
    return this.service.update(id, dto);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Patch(':id/reset-demo')
  resetDemoAccount(@Param('id') id: string) {
    return this.service.resetDemoAccount(id);
  }

  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  @Patch('user/:userId/:type/switch-currency')
  switchCurrency(
    @Param('userId') userId: string,
    @Param('type') type: AccountType,
    @Body() dto: SwitchAccountCurrencyDto,
  ) {
    return this.service.switchCurrency(userId, type, dto);
  }
}