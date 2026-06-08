import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAffiliateCommissionDto {
  @IsString()
    affiliateId!: string;

  @IsString()
    affiliateUserId!: string;

  @IsString()
    referredUserId!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNumber()
    @Min(1)
    amount!: number;

  @IsNumber()
    @Min(0)
    @Max(100)
    commissionPercentage!: number;

  @IsOptional()
  @IsString()
  description?: string;
}