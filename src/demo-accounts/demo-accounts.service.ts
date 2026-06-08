import { Injectable } from '@nestjs/common';
import { AccountCurrency, AccountType } from '@prisma/client';

import { TradingAccountsService } from '../trading-accounts/trading-accounts.service';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';

@Injectable()
export class DemoAccountsService {
  constructor(
    private readonly tradingAccountsService: TradingAccountsService,
  ) {}

  create(userId: string, currency: AccountCurrency = AccountCurrency.USD) {
    return this.tradingAccountsService.create({
      userId,
      type: AccountType.DEMO,
      currency,
    });
  }

  findByUser(userId: string) {
    return this.tradingAccountsService.findByUserAndType(
      userId,
      AccountType.DEMO,
    );
  }

  switchCurrency(userId: string, dto: SwitchAccountCurrencyDto) {
    return this.tradingAccountsService.switchCurrency(
      userId,
      AccountType.DEMO,
      dto,
    );
  }

  reset(accountId: string) {
    return this.tradingAccountsService.resetDemoAccount(accountId);
  }
}