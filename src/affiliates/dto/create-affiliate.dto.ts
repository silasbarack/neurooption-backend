import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAffiliateDto {
  @IsString()
    userId!: string;

  @IsString()
    code!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercentage?: number;
}