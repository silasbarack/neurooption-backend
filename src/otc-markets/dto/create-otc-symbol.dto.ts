import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateOtcSymbolDto {
  @IsString()
    symbol!: string;

  @IsString()
    displayName!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}