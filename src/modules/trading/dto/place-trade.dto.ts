import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export enum TradeTypeInput { REAL = 'real', DEMO = 'demo' }

export class PlaceTradeDto {
  @IsString()
  marketId: string;

  @IsEnum(['up', 'down'])
  direction: 'up' | 'down';

  @IsNumber()
  @Min(1)
  @Max(50000)
  amount: number;

  @IsNumber()
  @Min(5)
  @Max(86400)
  expirySeconds: number;

  @IsEnum(TradeTypeInput)
  tradeType: TradeTypeInput;

  @IsString()
  @IsOptional()
  signalId?: string;

  @IsNumber()
  @IsOptional()
  signalConfidence?: number;
}
