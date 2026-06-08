import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationStatus } from '@prisma/client';

export class UpdateNotificationStatusDto {
  @IsEnum(NotificationStatus)
  status!: NotificationStatus;

  @IsOptional()
  @IsString()
  failureReason?: string;
}