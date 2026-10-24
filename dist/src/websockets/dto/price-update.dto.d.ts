export declare enum MarketType {
    OTC = "OTC",
    REAL = "REAL"
}
export declare class PriceUpdateDto {
    symbol: string;
    marketType: MarketType;
    bid: number;
    ask: number;
    mid: number;
    timestamp: string;
}
