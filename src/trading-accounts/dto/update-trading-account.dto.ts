import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTradingAccountDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}