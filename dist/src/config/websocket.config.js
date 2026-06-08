"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketConfig = void 0;
const websocketConfig = () => ({
    websockets: {
        corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || '*',
        marketNamespace: process.env.WEBSOCKET_MARKET_NAMESPACE || 'market',
        tradingNamespace: process.env.WEBSOCKET_TRADING_NAMESPACE || 'trading',
    },
});
exports.websocketConfig = websocketConfig;
//# sourceMappingURL=websocket.config.js.map