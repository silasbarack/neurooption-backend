import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRealSymbolDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}