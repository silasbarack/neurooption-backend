import { IsNumber, Min } from 'class-validator';

export class SettleTradeDto {
  @IsNumber()
    @Min(0)
    exitPrice!: number;
}