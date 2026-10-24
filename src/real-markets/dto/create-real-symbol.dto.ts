import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRealSymbolDto {
  @IsString()
    symbol!: string;

  @IsString()
    displayName!: string;

  @IsString()
    source!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}