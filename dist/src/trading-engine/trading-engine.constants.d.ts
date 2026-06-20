export type OpenTradeDto = {
    userId?: string;
    assetSymbol: string;
    assetLabel?: string;
    timeframe?: string;
    side: 'BUY' | 'SELL';
    accountType: 'QT_DEMO' | 'QT_REAL' | 'QT Demo' | 'QT Real';
    currency: 'USD' | 'KES' | 'UGX' | 'TZS' | 'NGN' | 'XOF' | 'EUR' | 'CAD' | 'JPY' | 'CNY' | 'AOA' | 'ZAR' | 'BRL';
    stake: number;
    payout: number;
    expirySeconds: number;
};
