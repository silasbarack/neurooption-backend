import { CopyTradeStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateCopyTradeDto {
  @IsOptional()
  @IsEnum(CopyTradeStatus)
  status?: CopyTradeStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exitPrice?: number;

  @IsOptional()
  @IsNumber()
  profitAmount?: number;
}