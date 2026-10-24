export type GetTradesDto = {
  userId?: string;
  accountType?: 'QT_DEMO' | 'QT_REAL' | 'QT Demo' | 'QT Real';
  currency?:
    | 'USD'
    | 'KES'
    | 'UGX'
    | 'TZS'
    | 'NGN'
    | 'XOF'
    | 'EUR'
    | 'CAD'
    | 'JPY'
    | 'CNY'
    | 'AOA'
    | 'ZAR'
    | 'BRL';
  limit?: string;
};