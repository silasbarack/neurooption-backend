export const WebsocketEvents = {
  CONNECTED: 'connected',

  SUBSCRIBE_SYMBOL: 'subscribe_symbol',
  UNSUBSCRIBE_SYMBOL: 'unsubscribe_symbol',

  PRICE_UPDATE: 'price_update',
  CANDLE_UPDATE: 'candle_update',
  CHART_UPDATE: 'chart_update',

  TRADE_OPENED: 'trade_opened',
  TRADE_SETTLED: 'trade_settled',
  TRADE_CANCELLED: 'trade_cancelled',

  WALLET_UPDATE: 'wallet_update',
  DEPOSIT_UPDATE: 'deposit_update',
  WITHDRAWAL_UPDATE: 'withdrawal_update',
  PAYOUT_UPDATE: 'payout_update',

  ERROR: 'error',
};