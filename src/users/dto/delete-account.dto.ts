import { Equals, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const DELETE_ACCOUNT_CONFIRMATION = 'DELETE MY NEUROOPTION ACCOUNT';
export const DELETION_REASONS = {
  NO_LONGER_USE: 'I no longer use NeuroOption',
  TAKING_A_BREAK: 'I am taking a break from trading',
  FINANCIAL_CONCERNS: 'I have concerns about trading risks or losses',
  PRIVACY_CONCERNS: 'I have privacy or security concerns',
  TECHNICAL_ISSUES: 'I have experienced technical problems',
  PAYMENT_ISSUES: 'I have experienced deposit or withdrawal problems',
  ANOTHER_PLATFORM: 'I prefer another platform',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
} as const;

export class DeleteAccountDto {
  @Equals(DELETE_ACCOUNT_CONFIRMATION)
  confirmation: string;

  @IsString()
  @MaxLength(2000)
  currentPassword: string;

  @IsOptional()
  @IsIn(Object.keys(DELETION_REASONS))
  reason?: keyof typeof DELETION_REASONS;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  otherReason?: string;
}
