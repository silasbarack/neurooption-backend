import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSocialFollowDto {
  @IsString()
    followerUserId!: string;

  @IsString()
  traderUserId!: string;

  @IsNumber()
    @Min(1)
    @Max(100)
    copyPercentage!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStakeAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minStakeAmount?: number;
}