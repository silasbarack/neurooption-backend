import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateExpiryDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}