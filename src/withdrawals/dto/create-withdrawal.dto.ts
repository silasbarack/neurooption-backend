import { PaymentGatewayType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsString()
    userId!: string;

  @IsString()
    walletId!: string;

  @IsEnum(PaymentGatewayType)
    gatewayType!: PaymentGatewayType;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}