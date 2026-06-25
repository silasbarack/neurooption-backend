import { AccountCurrency } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RejectWithdrawalDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;

  @IsString()
  withdrawalId!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
