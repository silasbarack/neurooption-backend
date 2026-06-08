import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum TimeframeCode {
  S5 = 'S5',
  S10 = 'S10',
  S15 = 'S15',
  S30 = 'S30',

  M1 = 'M1',
  M2 = 'M2',
  M3 = 'M3',
  M5 = 'M5',
  M10 = 'M10',
  M15 = 'M15',
  M30 = 'M30',

  H1 = 'H1',
  H4 = 'H4',
  D1 = 'D1',
}

export class CreateTimeframeDto {
  @IsEnum(TimeframeCode)
    code!: TimeframeCode;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}