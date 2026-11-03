import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SocialSignupTokenDto {
  @IsString()
  @MaxLength(4096)
  signupToken!: string;
}

export class CompleteSocialSignupDto extends SocialSignupTokenDto {
  @IsBoolean()
  acceptTerms!: boolean;

  /** Only used when the provider shared no email. */
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;
}
