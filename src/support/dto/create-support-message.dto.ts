import { SupportSenderRole } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateSupportMessageDto {
  @IsString()
    ticketId!: string;

  @IsString()
    senderId!: string;

  @IsEnum(SupportSenderRole)
    senderRole!: SupportSenderRole;

  @IsString()
    message!: string;
}