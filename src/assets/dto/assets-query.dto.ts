import { AssetCategory, MarketType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class AssetsQueryDto {
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @IsOptional()
  @IsEnum(MarketType)
  marketType?: MarketType;

  @IsOptional()
  @IsString()
  search?: string;
}