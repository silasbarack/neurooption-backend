import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum MarketType {
  OTC = 'OTC',
  REAL = 'REAL',
}

export class SymbolQueryDto {
  @IsString()
  symbol!: string;

  @IsOptional()
  @IsEnum(MarketType)
  marketType?: MarketType;
}