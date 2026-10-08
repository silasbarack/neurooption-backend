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

  /**
   * The payout the trader was shown. When sent, the trade is accepted only
   * at exactly this payout; if it has changed, the trade is refused with the
   * new quote instead of silently using a different payout.
   */
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  @Max(100)
  quotedPayoutPercent?: number;

  /** Version of the asset payout the quote came from (informational). */
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  payoutVersion?: number;
}