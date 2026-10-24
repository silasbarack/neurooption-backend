import { IsString } from 'class-validator';

export class MarketTickQueryDto {
  @IsString()
  asset!: string;
}