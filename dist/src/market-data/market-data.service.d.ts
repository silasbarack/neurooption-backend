import { MessageEvent, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Observable } from "rxjs";
import type { MarketCategory, OtcAsset, OtcCandle, OtcTimeframe } from "./market-data.types";
export declare class MarketDataService implements OnModuleInit, OnModuleDestroy {
    private readonly states;
    private engineTimer;
    onModuleInit(): void;
    onModuleDestroy(): void;
    getAssets(category?: MarketCategory): OtcAsset[];
    getCandles(symbol: string, timeframe: OtcTimeframe, limit?: number): OtcCandle[];
    stream(symbol: string, timeframe: OtcTimeframe): Observable<MessageEvent>;
    private getOrCreateState;
    private generateInitialCandles;
    private advanceState;
    private getTimeframeVolatilityFactor;
    private toPayload;
    private randomNormal;
}
