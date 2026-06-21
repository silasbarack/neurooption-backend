export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'PENDING' | 'WON' | 'LOST' | 'DRAW';
export type AccountType = 'QT Demo' | 'QT Real';

export type AccountCurrency =
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

export type PlacedTrade = {
  id: string;
  userId: string;
  asset: string;
  timeframe: string;
  side: TradeSide;
  accountType: AccountType;
  currency: AccountCurrency;

  stakeAmount: number;
  stakeUsd: number;

  payoutPercent: number;
  expectedProfitAmount: number;
  expectedProfitUsd: number;
  expectedReturnAmount: number;
  expectedReturnUsd: number;

  entryPrice: number;
  entryTime: number;
  expirySeconds: number;
  expiryTime: number;

  status: TradeStatus;
  closePrice?: number;
  settledAt?: number;

  resultAmount?: number;
  resultUsd?: number;
  profitAmount?: number;
  profitUsd?: number;
};

export const ACCOUNT_TYPES: AccountType[] = ['QT Demo', 'QT Real'];

export const ACCOUNT_CURRENCIES: AccountCurrency[] = [
  'USD',
  'KES',
  'UGX',
  'TZS',
  'NGN',
  'XOF',
  'EUR',
  'CAD',
  'JPY',
  'CNY',
  'AOA',
  'ZAR',
  'BRL',
];

export const EXCHANGE_RATES_TO_USD_BASE: Record<AccountCurrency, number> = {
  USD: 1,
  KES: 129.5,
  UGX: 3710,
  TZS: 2600,
  NGN: 1510,
  XOF: 610,
  EUR: 0.92,
  CAD: 1.37,
  JPY: 157,
  CNY: 7.25,
  AOA: 890,
  ZAR: 18.1,
  BRL: 5.45,
};

export function currencyToUsd(amount: number, currency: AccountCurrency) {
  return amount / EXCHANGE_RATES_TO_USD_BASE[currency];
}

export function usdToCurrency(amountUsd: number, currency: AccountCurrency) {
  return amountUsd * EXCHANGE_RATES_TO_USD_BASE[currency];
}