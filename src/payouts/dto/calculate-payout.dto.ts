import { IsNumber, IsString, Min } from 'class-validator';

export class CalculatePayoutDto {
  @IsString()
  assetId!: string;

  @IsNumber()
  @Min(1)
  stakeAmount!: number;
}