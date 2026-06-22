import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketDataService } from '../market-data/market-data.service';
import { MARKET_ASSETS, SUPPORTED_TIMEFRAMES } from '../market-data/market-data.constants';
import { MarketGateway } from './market.gateway';

const TICK_INTERVAL_MS = 400;

// Runs continuously for the lifetime of the process, independent of whether
// any client is connected — the price feed never stops, it's just only
// broadcast to rooms that have a subscriber.
@Injectable()
export class MarketTickerService implements OnModuleInit, OnModuleDestroy {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly marketGateway: MarketGateway,
  ) {}

  onModuleInit() {
    this.intervalHandle = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  private tick() {
    for (const asset of MARKET_ASSETS) {
      if (!asset.isActive) continue;

      const symbolRoom = this.marketGateway.symbolRoom(asset.symbol);

      if (this.marketGateway.roomSize(symbolRoom) === 0) continue;

      const priceTick = this.marketDataService.getTick(asset.symbol);

      this.marketGateway.broadcastPriceUpdate({
        symbol: asset.symbol,
        price: priceTick.price,
        time: priceTick.time,
        serverTime: priceTick.serverTime,
      });

      for (const timeframe of SUPPORTED_TIMEFRAMES) {
        const chartRoom = this.marketGateway.chartRoom(asset.symbol, timeframe);

        if (this.marketGateway.roomSize(chartRoom) === 0) continue;

        const candle = this.marketDataService.getLatestCandle(asset.symbol, timeframe);

        this.marketGateway.broadcastCandleUpdate({
          symbol: asset.symbol,
          timeframe,
          candle: {
            time: candle.time,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          },
        });
      }
    }
  }
}
