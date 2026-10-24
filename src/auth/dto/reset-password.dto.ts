import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  recaptchaToken?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Verification code must be exactly 6 digits.' })
  code!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
