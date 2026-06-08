import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  KYC_ADMIN = 'KYC_ADMIN',
  RISK_ADMIN = 'RISK_ADMIN',
  COMPLIANCE_ADMIN = 'COMPLIANCE_ADMIN',
}

export class CreateAdminDto {
  @IsString()
    fullName!: string;

  @IsEmail()
    email!: string;

  @IsString()
    @MinLength(8)
    password!: string;

  @IsEnum(AdminRole)
    role!: AdminRole;

  @IsOptional()
  @IsString()
  phone?: string;
}