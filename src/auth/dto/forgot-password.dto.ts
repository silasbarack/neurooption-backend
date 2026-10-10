import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsOptional()
  @IsString()
  recaptchaToken?: string;

  @IsEmail()
    email!: string;
}