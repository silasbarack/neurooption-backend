import { Injectable } from '@nestjs/common';
import { CreateCandleDto, CandleType } from './dto/create-candle.dto';
import { CandleQueryDto } from './dto/candle-query.dto';

@Injectable()
export class CandlesService {
  private candles: any[] = [];

  create(dto: CreateCandleDto) {
    const candle = {
      id: crypto.randomUUID(),
      ...dto,
      openedAt: new Date(dto.openedAt),
      closedAt: new Date(dto.closedAt),
      createdAt: new Date(),
    };

    this.candles.push(candle);
    return candle;
  }

  findAll() {
    return this.candles;
  }

  findByQuery(query: CandleQueryDto) {
    return this.candles.filter((candle) => {
      const matchesSymbol = candle.symbol === query.symbol;
      const matchesTimeframe = candle.timeframe === query.timeframe;
      const matchesType = query.type ? candle.type === query.type : true;

      return matchesSymbol && matchesTimeframe && matchesType;
    });
  }

  generateHeikenAshi(symbol: string, timeframe: string) {
    const normalCandles = this.candles.filter(
      (candle) =>
        candle.symbol === symbol &&
        candle.timeframe === timeframe &&
        candle.type === CandleType.CANDLESTICK,
    );

    const heikenAshi: any[] = [];

    for (let i = 0; i < normalCandles.length; i++) {
      const current = normalCandles[i];
      const previousHA = heikenAshi[i - 1];

      const close =
        (current.open + current.high + current.low + current.close) / 4;

      const open = previousHA
        ? (previousHA.open + previousHA.close) / 2
        : (current.open + current.close) / 2;

      const high = Math.max(current.high, open, close);
      const low = Math.min(current.low, open, close);

      heikenAshi.push({
        id: crypto.randomUUID(),
        symbol,
        timeframe,
        type: CandleType.HEIKEN_ASHI,
        open,
        high,
        low,
        close,
        volume: current.volume,
        openedAt: current.openedAt,
        closedAt: current.closedAt,
      });
    }

    return heikenAshi;
  }
}