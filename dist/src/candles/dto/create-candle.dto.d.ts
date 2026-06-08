export declare enum CandleType {
    CANDLESTICK = "CANDLESTICK",
    HEIKEN_ASHI = "HEIKEN_ASHI",
    BAR = "BAR",
    LINE = "LINE"
}
export declare class CreateCandleDto {
    symbol: string;
    timeframe: string | undefined;
    type: CandleType;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    openedAt: string;
    closedAt: string;
}
