import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum KycDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewKycDto {
  @IsEnum(KycDecision)
    status!: KycDecision;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}