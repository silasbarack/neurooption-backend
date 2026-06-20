export type AccountTypeInput = 'QT_DEMO' | 'QT_REAL' | 'QT Demo' | 'QT Real';
export type AccountCurrencyInput = 'USD' | 'KES' | 'UGX' | 'TZS' | 'NGN' | 'XOF' | 'EUR' | 'CAD' | 'JPY' | 'CNY' | 'AOA' | 'ZAR' | 'BRL';
export type OpenTradesDto = {
    userId?: string;
    accountType?: AccountTypeInput;
    currency?: AccountCurrencyInput;
    limit?: string;
};
