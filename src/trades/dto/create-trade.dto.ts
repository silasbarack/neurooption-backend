import { TradeDirection } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTradeDto {
  @IsString()
    userId!: string;

  @IsString()
    assetId!: string;

  @IsOptional()
  @IsString()
  expiryId?: string;

  @IsEnum(TradeDirection)
    direction!: TradeDirection;

  @IsNumber()
    @Min(1)
    stakeAmount!: number;

  @IsNumber()
  @Min(0)
  entryPrice!: number;

  @IsString()
  expiresAt!: string;
}