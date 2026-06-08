import { AccountCurrency } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class SwitchAccountCurrencyDto {
  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;
}