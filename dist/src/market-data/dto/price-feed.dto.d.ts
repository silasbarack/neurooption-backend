export declare enum MarketType {
    OTC = "OTC",
    REAL = "REAL"
}
export declare class PriceFeedDto {
    symbol: string;
    marketType: MarketType;
    bid: number;
    ask: number;
}
