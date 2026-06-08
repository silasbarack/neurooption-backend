import { TransactionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDepositStatusDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @IsOptional()
  @IsString()
  externalRef?: string;
}