import { IsString } from 'class-validator';

export class CreateSupportTicketDto {
  @IsString()
  userId!: string;

  @IsString()
  subject!: string;
}