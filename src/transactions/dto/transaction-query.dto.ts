import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  TransactionStatus,
  TransactionType,
} from './create-transaction.dto';

export class TransactionQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  walletId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}