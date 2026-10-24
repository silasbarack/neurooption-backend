import { TransactionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @IsOptional()
  @IsString()
  description?: string;
}