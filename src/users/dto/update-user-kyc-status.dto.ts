import { KycStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserKycStatusDto {
  @IsEnum(KycStatus)
    kycStatus!: KycStatus;
}