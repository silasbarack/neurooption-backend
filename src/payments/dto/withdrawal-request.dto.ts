import { IsNumber, IsString, Min } from 'class-validator';

export class WithdrawalRequestDto {
  @IsString()
  phone!: string;

  @IsNumber()
  @Min(1)
  amount!: number;
}
