export declare enum TradeStatus {
    OPEN = "OPEN",
    WON = "WON",
    LOST = "LOST",
    DRAW = "DRAW",
    CANCELLED = "CANCELLED"
}
export declare class TradeUpdateDto {
    userId: string;
    tradeId: string;
    symbol: string;
    status: TradeStatus;
    entryPrice: number;
    closePrice: number;
    amount: number;
    profit: number;
    payout: number;
}
