import { Equals, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { DELETION_REASON_CODES, DELETION_CONFIRMATION_WORD } from '../account-deletion.constants';

export class DeleteAccountDto {
  /** Re-entered so a stolen session alone cannot close the account. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password!: string;

  /** Exact typed confirmation; no case folding or whitespace normalization. */
  @Equals(DELETION_CONFIRMATION_WORD)
  @IsString()
  @MaxLength(50)
  confirmation!: string;

  @IsOptional()
  @IsString()
  @IsIn(DELETION_REASON_CODES)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
