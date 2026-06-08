import { AccountCurrency, AccountType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateTradingAccountDto {
  @IsString()
  userId!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;
}