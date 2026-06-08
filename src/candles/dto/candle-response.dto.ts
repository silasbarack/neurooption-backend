export class CandleResponseDto {
  id!: string;
  symbol!: string;
  timeframe!: string;
  type!: string;
  open!: number;
  high!: number;
  low!: number;
  close!: number;
  volume!: number;
  openedAt!: Date;
  closedAt!: Date;
}