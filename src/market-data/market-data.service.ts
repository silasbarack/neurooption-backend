import { Injectable, NotFoundException } from '@nestjs/common';
import { PriceFeedDto } from './dto/price-feed.dto';

@Injectable()
export class MarketDataService {
  private prices: any[] = [
    this.buildPrice('EURUSD', 'REAL', 1.0842, 1.0844),
    this.buildPrice('GBPUSD', 'REAL', 1.2715, 1.2717),
    this.buildPrice('USDJPY', 'REAL', 156.22, 156.25),
    this.buildPrice('BTCUSD', 'REAL', 68000, 68020),

    this.buildPrice('EURUSD-OTC', 'OTC', 1.0838, 1.0840),
    this.buildPrice('GBPUSD-OTC', 'OTC', 1.2708, 1.2711),
    this.buildPrice('USDJPY-OTC', 'OTC', 156.10, 156.13),
  ];

  findAll() {
    return this.prices;
  }

  findBySymbol(symbol: string) {
    const price = this.prices.find((item) => item.symbol === symbol);

    if (!price) {
      throw new NotFoundException('Market price not found');
    }

    return price;
  }

  findByMarketType(marketType: 'OTC' | 'REAL') {
    return this.prices.filter((item) => item.marketType === marketType);
  }

  updatePrice(dto: PriceFeedDto) {
    const existing = this.prices.find((item) => item.symbol === dto.symbol);

    const price = this.buildPrice(dto.symbol, dto.marketType, dto.bid, dto.ask);

    if (existing) {
      Object.assign(existing, price);
      return existing;
    }

    this.prices.push(price);
    return price;
  }

  getCurrentMidPrice(symbol: string): number {
    return this.findBySymbol(symbol).mid;
  }

  private buildPrice(
    symbol: string,
    marketType: 'OTC' | 'REAL',
    bid: number,
    ask: number,
  ) {
    return {
      symbol,
      marketType,
      bid,
      ask,
      mid: Number(((bid + ask) / 2).toFixed(6)),
      timestamp: new Date(),
    };
  }
}