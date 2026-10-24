import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTimeframeDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}