import { Controller, Get, MessageEvent, Query, Sse } from "@nestjs/common";
import { Observable } from "rxjs";
import { MarketDataService } from "./market-data.service";
import type { MarketCategory, OtcTimeframe } from "./market-data.types";

const VALID_TIMEFRAMES: OtcTimeframe[] = ["M1", "M2", "M3", "M5", "M15", "M30", "H1", "H4"];

@Controller("market-data")
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get("assets")
  getAssets(@Query("category") category?: MarketCategory) {
    return {
      success: true,
      assets: this.marketDataService.getAssets(category),
    };
  }

  @Get("candles")
  getCandles(
    @Query("symbol") symbol = "AUD/CAD OTC",
    @Query("timeframe") timeframe: OtcTimeframe = "M1",
    @Query("limit") limit = "120",
  ) {
    return {
      success: true,
      symbol,
      timeframe: this.normalizeTimeframe(timeframe),
      candles: this.marketDataService.getCandles(
        symbol,
        this.normalizeTimeframe(timeframe),
        Number(limit) || 120,
      ),
    };
  }

  @Sse("stream")
  stream(
    @Query("symbol") symbol = "AUD/CAD OTC",
    @Query("timeframe") timeframe: OtcTimeframe = "M1",
  ): Observable<MessageEvent> {
    return this.marketDataService.stream(symbol, this.normalizeTimeframe(timeframe));
  }

  private normalizeTimeframe(value: string): OtcTimeframe {
    if (VALID_TIMEFRAMES.includes(value as OtcTimeframe)) {
      return value as OtcTimeframe;
    }

    return "M1";
  }
}