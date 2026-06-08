import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AccountType } from '@prisma/client';

import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';
import { TradingAccountsService } from './trading-accounts.service';

@Controller('trading-accounts')
export class TradingAccountsController {
  constructor(private readonly service: TradingAccountsService) {}

  @Post()
  create(@Body() dto: CreateTradingAccountDto) {
    return this.service.create(dto);
  }

  @Post('default/:userId')
  createDefaultAccounts(@Param('userId') userId: string) {
    return this.service.createDefaultAccounts(userId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Get('user/:userId/type/:type')
  findByUserAndType(
    @Param('userId') userId: string,
    @Param('type') type: AccountType,
  ) {
    return this.service.findByUserAndType(userId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTradingAccountDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/reset-demo')
  resetDemoAccount(@Param('id') id: string) {
    return this.service.resetDemoAccount(id);
  }

  @Patch('user/:userId/:type/switch-currency')
  switchCurrency(
    @Param('userId') userId: string,
    @Param('type') type: AccountType,
    @Body() dto: SwitchAccountCurrencyDto,
  ) {
    return this.service.switchCurrency(userId, type, dto);
  }
}