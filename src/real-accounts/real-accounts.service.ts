import { Injectable } from '@nestjs/common';
import { AccountCurrency, AccountType } from '@prisma/client';

import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { TradingAccountsService } from '../trading-accounts/trading-accounts.service';

@Injectable()
export class RealAccountsService {
  constructor(
    private readonly tradingAccountsService: TradingAccountsService,
  ) {}

  create(userId: string, currency: AccountCurrency = AccountCurrency.KES) {
    return this.tradingAccountsService.create({
      userId,
      type: AccountType.REAL,
      currency,
    });
  }

  findByUser(userId: string) {
    return this.tradingAccountsService.findByUserAndType(
      userId,
      AccountType.REAL,
    );
  }

  switchCurrency(userId: string, dto: SwitchAccountCurrencyDto) {
    return this.tradingAccountsService.switchCurrency(
      userId,
      AccountType.REAL,
      dto,
    );
  }
}