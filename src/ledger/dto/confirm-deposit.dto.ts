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

const DEPOSIT_PROVIDERS: DepositProvider[] = [
  'MPESA',
  'CARD',
  'BANK',
  'CRYPTO',
  'BINANCE',
];

export class ConfirmDepositDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;

  @IsIn(DEPOSIT_PROVIDERS)
  provider!: DepositProvider;

  @IsString()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  externalReference?: string;

  @IsOptional()
  @IsString()
  depositId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
