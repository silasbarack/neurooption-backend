import { AccountCurrency } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SettleTradeWonDto {
  @IsString()
  userId!: string;

  @IsString()
  tradeId!: string;

  @IsNumber()
  @Min(0.01)
  stakeAmount!: number;

  @IsNumber()
  @Min(0)
  profitAmount!: number;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
