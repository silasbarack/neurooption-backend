export class IndicatorResultDto {
  symbol!: string;
  timeframe!: string;
  indicator!: string;
  values!: any[];
  generatedAt!: Date;
}