import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateKycDto {
  @IsString()
    userId!: string;

  @IsString()
  documentType: string | undefined;

  @IsOptional()
  @IsString()
  documentNumber?: string;
}