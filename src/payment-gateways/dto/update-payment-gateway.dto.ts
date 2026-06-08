import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentGatewayDto {
  @IsOptional()
  @IsString()
  name?: string;

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