import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  NotificationChannel,
  NotificationType,
} from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsString()
  @MinLength(2)
  subject!: string;

  @IsString()
  @MinLength(2)
  body!: string;

  @IsEmail()
  recipientEmail!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  kycRecordId?: string;

  @IsOptional()
  @IsString()
  supportTicketId?: string;
}