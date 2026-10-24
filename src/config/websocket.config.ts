export const websocketConfig = () => ({
  websockets: {
    corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
    marketNamespace: process.env.WEBSOCKET_MARKET_NAMESPACE || 'market',
    tradingNamespace: process.env.WEBSOCKET_TRADING_NAMESPACE || 'trading',
  },
});