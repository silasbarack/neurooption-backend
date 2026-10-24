import { IsNumber, IsOptional } from 'class-validator';

export class CandleDto {
  @IsNumber()
  time!: number;

  @IsNumber()
  open!: number;

  @IsNumber()
  high!: number;

  @IsNumber()
  low!: number;

  @IsNumber()
  close!: number;

  @IsOptional()
  @IsNumber()
  volume?: number;
}