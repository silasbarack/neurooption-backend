import { IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateAssetPayoutDto {
  @IsString()
  assetId!: string;

  @IsNumber()
  @Min(20)
  @Max(92)
  payoutPercentage!: number;
}