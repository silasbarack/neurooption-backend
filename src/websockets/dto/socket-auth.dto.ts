import { IsString } from 'class-validator';

export class SocketAuthDto {
  @IsString()
    token!: string;
}