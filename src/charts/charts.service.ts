import { Injectable } from '@nestjs/common';
import { CandlesService } from '../candles/candles.service';
import { ChartQueryDto } from './dto/chart-query.dto';
import { ChartType } from './dto/chart-type.dto';
import { CandleType } from '../candles/dto/create-candle.dto';

@Injectable()
export class ChartsService {
  constructor(private readonly candlesService: CandlesService) {}

  getChartData(query: ChartQueryDto) {
    if (query.chartType === ChartType.HEIKEN_ASHI) {
      return this.candlesService.generateHeikenAshi(
        query.symbol,
        query.timeframe,
      );
    }

    const candleType =
      query.chartType === ChartType.CANDLESTICK
        ? CandleType.CANDLESTICK
        : query.chartType === ChartType.BAR
          ? CandleType.BAR
          : CandleType.LINE;

    return this.candlesService.findByQuery({
      symbol: query.symbol,
      timeframe: query.timeframe,
      type: candleType,
    });
  }
}