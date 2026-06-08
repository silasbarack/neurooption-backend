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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingGateway = void 0;
const socket_io_1 = require("socket.io");
const websockets_events_1 = require("./websockets-events");
const noOpDecorator = () => () => { };
let ConnectedSocket = noOpDecorator;
let MessageBody = noOpDecorator;
let SubscribeMessage = noOpDecorator;
let WebSocketGateway = noOpDecorator;
let WebSocketServer = noOpDecorator;
try {
    const nestWebsockets = require('@nestjs/websockets');
    ConnectedSocket = nestWebsockets.ConnectedSocket ?? ConnectedSocket;
    MessageBody = nestWebsockets.MessageBody ?? MessageBody;
    SubscribeMessage = nestWebsockets.SubscribeMessage ?? SubscribeMessage;
    WebSocketGateway = nestWebsockets.WebSocketGateway ?? WebSocketGateway;
    WebSocketServer = nestWebsockets.WebSocketServer ?? WebSocketServer;
}
catch { }
let TradingGateway = class TradingGateway {
    handleConnection(client) {
        client.emit(websockets_events_1.WebsocketEvents.CONNECTED, {
            message: 'Connected to NeuroOption trading websocket',
            socketId: client.id,
        });
    }
    handleDisconnect(client) {
        console.log(`Trading socket disconnected: ${client.id}`);
    }
    joinUserRoom(client, data) {
        client.join(this.getUserRoom(data.userId));
        return {
            event: 'join_user_room',
            message: `Joined user room ${data.userId}`,
        };
    }
    leaveUserRoom(client, data) {
        client.leave(this.getUserRoom(data.userId));
        return {
            event: 'leave_user_room',
            message: `Left user room ${data.userId}`,
        };
    }
    emitTradeOpened(userId, trade) {
        this.server.to(this.getUserRoom(userId)).emit(websockets_events_1.WebsocketEvents.TRADE_OPENED, {
            userId,
            trade,
            timestamp: new Date(),
        });
    }
    emitTradeSettled(dto) {
        this.server
            .to(this.getUserRoom(dto.userId))
            .emit(websockets_events_1.WebsocketEvents.TRADE_SETTLED, {
            ...dto,
            timestamp: new Date(),
        });
    }
    emitTradeCancelled(userId, tradeId) {
        this.server
            .to(this.getUserRoom(userId))
            .emit(websockets_events_1.WebsocketEvents.TRADE_CANCELLED, {
            userId,
            tradeId,
            timestamp: new Date(),
        });
    }
    emitWalletUpdate(userId, wallet) {
        this.server
            .to(this.getUserRoom(userId))
            .emit(websockets_events_1.WebsocketEvents.WALLET_UPDATE, {
            userId,
            wallet,
            timestamp: new Date(),
        });
    }
    emitDepositUpdate(userId, deposit) {
        this.server
            .to(this.getUserRoom(userId))
            .emit(websockets_events_1.WebsocketEvents.DEPOSIT_UPDATE, {
            userId,
            deposit,
            timestamp: new Date(),
        });
    }
    emitWithdrawalUpdate(userId, withdrawal) {
        this.server
            .to(this.getUserRoom(userId))
            .emit(websockets_events_1.WebsocketEvents.WITHDRAWAL_UPDATE, {
            userId,
            withdrawal,
            timestamp: new Date(),
        });
    }
    emitPayoutUpdate(userId, payout) {
        this.server
            .to(this.getUserRoom(userId))
            .emit(websockets_events_1.WebsocketEvents.PAYOUT_UPDATE, {
            userId,
            payout,
            timestamp: new Date(),
        });
    }
    getUserRoom(userId) {
        return `user:${userId}`;
    }
};
exports.TradingGateway = TradingGateway;
__decorate([
    WebSocketServer(),
    __metadata("design:type", socket_io_1.Server)
], TradingGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('join_user_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TradingGateway.prototype, "joinUserRoom", null);
__decorate([
    SubscribeMessage('leave_user_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TradingGateway.prototype, "leaveUserRoom", null);
exports.TradingGateway = TradingGateway = __decorate([
    WebSocketGateway({
        namespace: 'trading',
        cors: {
            origin: '*',
        },
    })
], TradingGateway);
//# sourceMappingURL=trading.gateway.js.map