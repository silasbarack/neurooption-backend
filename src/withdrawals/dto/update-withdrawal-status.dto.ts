import { TransactionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWithdrawalStatusDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @IsOptional()
  @IsString()
  externalRef?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}