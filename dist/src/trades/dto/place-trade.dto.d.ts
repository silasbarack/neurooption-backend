export declare enum TradeDirection {
    BUY = "BUY",
    SELL = "SELL"
}
export declare class PlaceTradeDto {
    assetId: string;
    amount: number;
    direction: TradeDirection;
    durationSeconds: number;
}
