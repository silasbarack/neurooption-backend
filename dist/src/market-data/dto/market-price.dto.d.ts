export declare class MarketPriceDto {
    symbol: string;
    marketType: 'OTC' | 'REAL';
    bid: number;
    ask: number;
    mid: number;
    timestamp: Date;
}
