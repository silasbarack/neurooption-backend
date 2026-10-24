import { IsNumber, IsString } from 'class-validator';

export class SettleTradeDto {
  @IsString()
    tradeId!: string;

  @IsNumber()
  closePrice!: number;
}