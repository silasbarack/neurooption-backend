"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const websockets_events_1 = require("./websockets-events");
let MarketGateway = class MarketGateway {
    handleConnection(client) {
        client.emit(websockets_events_1.WebsocketEvents.CONNECTED, {
            message: 'Connected to NeuroOption market websocket',
            socketId: client.id,
        });
    }
    handleDisconnect(client) {
        console.log(`Market socket disconnected: ${client.id}`);
    }
    subscribeSymbol(client, data) {
        const symbolRoom = this.getSymbolRoom(data.symbol);
        client.join(symbolRoom);
        if (data.timeframe) {
            client.join(this.getChartRoom(data.symbol, data.timeframe));
        }
        return {
            event: websockets_events_1.WebsocketEvents.SUBSCRIBE_SYMBOL,
            message: `Subscribed to ${data.symbol}`,
        };
    }
    unsubscribeSymbol(client, data) {
        client.leave(this.getSymbolRoom(data.symbol));
        if (data.timeframe) {
            client.leave(this.getChartRoom(data.symbol, data.timeframe));
        }
        return {
            event: websockets_events_1.WebsocketEvents.UNSUBSCRIBE_SYMBOL,
            message: `Unsubscribed from ${data.symbol}`,
        };
    }
    broadcastPriceUpdate(dto) {
        this.server
            .to(this.getSymbolRoom(dto.symbol))
            .emit(websockets_events_1.WebsocketEvents.PRICE_UPDATE, dto);
    }
    broadcastCandleUpdate(dto) {
        this.server
            .to(this.getChartRoom(dto.symbol, dto.timeframe))
            .emit(websockets_events_1.WebsocketEvents.CANDLE_UPDATE, dto);
    }
    broadcastChartUpdate(symbol, timeframe, chartData) {
        this.server
            .to(this.getChartRoom(symbol, timeframe))
            .emit(websockets_events_1.WebsocketEvents.CHART_UPDATE, {
            symbol,
            timeframe,
            data: chartData,
            timestamp: new Date(),
        });
    }
    getSymbolRoom(symbol) {
        return `symbol:${symbol}`;
    }
    getChartRoom(symbol, timeframe) {
        return `chart:${symbol}:${timeframe}`;
    }
};
exports.MarketGateway = MarketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MarketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)(websockets_events_1.WebsocketEvents.SUBSCRIBE_SYMBOL),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "subscribeSymbol", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(websockets_events_1.WebsocketEvents.UNSUBSCRIBE_SYMBOL),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "unsubscribeSymbol", null);
exports.MarketGateway = MarketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'market',
        cors: {
            origin: '*',
        },
    })
], MarketGateway);
//# sourceMappingURL=market.gateway.js.map