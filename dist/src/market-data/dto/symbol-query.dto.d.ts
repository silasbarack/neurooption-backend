export declare enum MarketType {
    OTC = "OTC",
    REAL = "REAL"
}
export declare class SymbolQueryDto {
    symbol: string;
    marketType?: MarketType;
}
