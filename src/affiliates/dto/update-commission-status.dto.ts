import { CommissionStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCommissionStatusDto {
  @IsEnum(CommissionStatus)
    status!: CommissionStatus;
}