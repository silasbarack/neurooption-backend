import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  ACCOUNT_CURRENCIES,
  ACCOUNT_TYPES,
  AccountCurrency,
  AccountType,
  TradeSide,
} from '../trading-engine.types';
import { SUPPORTED_TIMEFRAMES } from '../../market-data/market-data.constants';

export class PlaceTradeDto {
  @IsOptional()
  @IsString()
  userId?: string = 'demo-user';

  @IsString()
  asset!: string;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_TIMEFRAMES)
  timeframe?: string = 'M1';

  @IsString()
  @IsIn(['BUY', 'SELL'])
  side!: TradeSide;

  @IsOptional()
  @IsString()
  @IsIn(ACCOUNT_TYPES)
  accountType?: AccountType = 'QT Demo';

  @IsOptional()
  @IsString()
  @IsIn(ACCOUNT_CURRENCIES)
  currency?: AccountCurrency = 'USD';

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  amount!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(5)
  @Max(18000)
  expirySeconds!: number;
}