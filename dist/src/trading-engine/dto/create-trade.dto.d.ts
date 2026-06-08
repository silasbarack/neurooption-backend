export declare enum TradeDirection {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum MarketType {
    OTC = "OTC",
    REAL = "REAL"
}
export declare class CreateTradeDto {
    symbol: string;
    direction: TradeDirection;
    amount: number;
    expiry: string;
    timeframe: string;
    marketType: MarketType;
}
