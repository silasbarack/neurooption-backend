import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
export class ForgotPasswordDto {
  @IsEmail() email: string;
}
export class ResetPasswordDto {
  @IsEmail() email: string;
  @Matches(/^\d{6}$/, { message: 'code must be the 6-digit code from the email' }) code: string;
  @IsString() @MinLength(8) password: string;
}
export class DeleteAccountDto {
  @IsString() password: string;
}
