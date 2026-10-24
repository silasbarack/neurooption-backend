import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class CreateExpiryDto {
  @IsString()
    @Matches(/^([0-4][0-9]|05):[0-5][0-9]:[0-5][0-9]$/)
    duration!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}