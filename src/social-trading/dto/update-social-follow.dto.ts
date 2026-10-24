import { SocialFollowStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateSocialFollowDto {
  @IsOptional()
  @IsEnum(SocialFollowStatus)
  status?: SocialFollowStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  copyPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStakeAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minStakeAmount?: number;
}