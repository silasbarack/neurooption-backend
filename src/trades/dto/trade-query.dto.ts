import { TradeDirection, TradeStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class TradeQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsEnum(TradeDirection)
  direction?: TradeDirection;

  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;
}