import { IsNumber, IsString, Max, Min } from 'class-validator';

export class StkPushDto {
  @IsString()
  phone!: string;

  @IsNumber()
  @Min(1)
  @Max(150000)
  amount!: number;
}
