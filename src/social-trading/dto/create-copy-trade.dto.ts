import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCopyTradeDto {
  @IsString()
    socialFollowId!: string;

  @IsString()
  masterUserId!: string;

  @IsString()
  followerUserId!: string;

  @IsString()
  masterTradeId!: string;

  @IsOptional()
  @IsString()
  followerTradeId?: string;

  @IsNumber()
  @Min(1)
  stakeAmount!: number;

  @IsNumber()
  @Min(0)
  payoutRate!: number;

  @IsNumber()
  @Min(0)
  entryPrice!: number;
}