import { PaymentDirection, PaymentGatewayType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePaymentGatewayDto {
  @IsString()
    name!: string;

  @IsEnum(PaymentGatewayType)
    type!: PaymentGatewayType;

  @IsEnum(PaymentDirection)
  direction!: PaymentDirection;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  publicKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}