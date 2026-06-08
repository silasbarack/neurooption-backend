import { TransactionStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  userId!: string;

  @IsString()
  walletId!: string;

  @IsString()
  transactionId!: string;

  @IsOptional()
  @IsString()
  gatewayId?: string;

  @IsOptional()
  @IsString()
  tradeId?: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}