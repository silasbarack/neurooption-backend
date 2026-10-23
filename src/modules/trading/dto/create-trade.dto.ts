import { IsEnum, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { TradeDirection, TradeMode } from '../trade.entity';
export class CreateTradeDto {
  @IsString() assetId: string;
  @IsEnum(TradeDirection) direction: TradeDirection;
  @IsNumber() @Min(1) @Max(10000) amount: number;
  @IsNumber() @Min(30) @Max(86400) durationSeconds: number;
  @IsOptional() @IsEnum(TradeMode) mode?: TradeMode;
  @IsOptional() @IsString() signalId?: string;
}
