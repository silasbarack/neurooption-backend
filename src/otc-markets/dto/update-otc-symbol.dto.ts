import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateOtcSymbolDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}