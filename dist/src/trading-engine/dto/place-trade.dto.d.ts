import { AccountCurrency, AccountType, TradeSide } from '../trading-engine.types';
export declare class PlaceTradeDto {
    userId?: string;
    asset: string;
    timeframe?: string;
    side: TradeSide;
    accountType?: AccountType;
    currency?: AccountCurrency;
    amount: number;
    expirySeconds: number;
}
