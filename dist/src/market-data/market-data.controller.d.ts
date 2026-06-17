import { MessageEvent } from "@nestjs/common";
import { Observable } from "rxjs";
import { MarketDataService } from "./market-data.service";
import type { MarketCategory, OtcTimeframe } from "./market-data.types";
export declare class MarketDataController {
    private readonly marketDataService;
    constructor(marketDataService: MarketDataService);
    getAssets(category?: MarketCategory): {
        success: boolean;
        assets: import("./market-data.types").OtcAsset[];
    };
    getCandles(symbol?: string, timeframe?: OtcTimeframe, limit?: string): {
        success: boolean;
        symbol: string;
        timeframe: OtcTimeframe;
        candles: import("./market-data.types").OtcCandle[];
    };
    stream(symbol?: string, timeframe?: OtcTimeframe): Observable<MessageEvent>;
    private normalizeTimeframe;
}
