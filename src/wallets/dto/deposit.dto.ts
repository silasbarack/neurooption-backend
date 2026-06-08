import {
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class DepositDto {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  currency!: string;

  @IsString()
  method!: string;
}