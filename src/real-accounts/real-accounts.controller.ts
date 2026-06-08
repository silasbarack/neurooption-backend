import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AccountCurrency } from '@prisma/client';

import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { RealAccountsService } from './real-accounts.service';

@Controller('real-accounts')
export class RealAccountsController {
  constructor(private readonly service: RealAccountsService) {}

  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body('currency') currency?: AccountCurrency,
  ) {
    return this.service.create(userId, currency);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }

  @Patch('user/:userId/switch-currency')
  switchCurrency(
    @Param('userId') userId: string,
    @Body() dto: SwitchAccountCurrencyDto,
  ) {
    return this.service.switchCurrency(userId, dto);
  }
}