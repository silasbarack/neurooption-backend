import { AccountCurrency } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PlaceTradeDto {
  @IsString()
  userId!: string;

  @IsString()
  tradeId!: string;

  @IsNumber()
  @Min(0.01)
  stakeAmount!: number;

  @IsEnum(AccountCurrency)
  currency!: AccountCurrency;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
