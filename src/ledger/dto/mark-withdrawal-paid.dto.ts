import { AccountCurrency } from '@prisma/client';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import type { DepositProvider } from '../ledger.types';

const PAYOUT_PROVIDERS: DepositProvider[] = [
  'MPESA',
  'CARD',
  'BANK',
  'CRYPTO',
  'BINANCE',
];

export class MarkWithdrawalPaidDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;

  @IsString()
  withdrawalId!: string;

  @IsIn(PAYOUT_PROVIDERS)
  provider!: DepositProvider;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
