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
const market_data_constants_1 = require("../market-data/market-data.constants");
const market_data_service_1 = require("../market-data/market-data.service");
const timeframe_config_1 = require("../market-data/timeframe.config");
const latency_metrics_service_1 = require("../monitoring/latency-metrics.service");
const websockets_events_1 = require("./websockets-events");
const MAX_SUBSCRIPTIONS_PER_SOCKET = 12;
let MarketGateway = class MarketGateway {
    constructor(marketDataService, metrics) {
        this.marketDataService = marketDataService;
        this.metrics = metrics;
        this.watched = new Set();
        this.watchedCheckedAt = 0;
    }
    handleConnection(client) {
        this.metrics.setCounter('active_websocket_connections', this.server.sockets.size);
        const serverTimestamp = Date.now();
        client.emit(websockets_events_1.WebsocketEvents.CONNECTED, {
            message: 'Connected to NeuroOption market websocket',
            socketId: client.id,
            protocolVersion: 2,
            serverTimestamp,
            serverTime: new Date(serverTimestamp).toISOString(),
        });
    }
    handleDisconnect() {
        this.metrics.setCounter('active_websocket_connections', this.server.sockets.size);
    }
    subscribeSymbol(client, data) {
        const symbol = this.normalizeSymbol(data?.symbol);
        const timeframe = data?.timeframe
            ? (0, timeframe_config_1.normalizeTimeframe)(data.timeframe)
            : undefined;
        const marketRooms = Array.from(client.rooms).filter((room) => room.startsWith('symbol:') || room.startsWith('chart:'));
        if (marketRooms.length >= MAX_SUBSCRIPTIONS_PER_SOCKET) {
            return {
                event: websockets_events_1.WebsocketEvents.ERROR,
                message: 'Too many market subscriptions.',
            };
        }
        client.join(this.symbolRoom(symbol));
        if (timeframe)
            client.join(this.chartRoom(symbol, timeframe));
        const tick = this.marketDataService.getTick(symbol);
        return {
            event: websockets_events_1.WebsocketEvents.SUBSCRIBE_SYMBOL,
            symbol,
            timeframe,
            sequence: Number(tick.sequence ?? 0),
            serverTimestamp: Date.now(),
        };
    }
    unsubscribeSymbol(client, data) {
        const symbol = this.normalizeSymbol(data?.symbol);
        client.leave(this.symbolRoom(symbol));
        if (data?.timeframe && (0, timeframe_config_1.isSupportedTimeframe)(data.timeframe.toUpperCase())) {
            client.leave(this.chartRoom(symbol, data.timeframe.toUpperCase()));
        }
        return {
            event: websockets_events_1.WebsocketEvents.UNSUBSCRIBE_SYMBOL,
            symbol,
            serverTimestamp: Date.now(),
        };
    }
    serverTime(data = {}) {
        const serverTimestamp = Date.now();
        return {
            event: websockets_events_1.WebsocketEvents.SERVER_TIME,
            clientSentAt: Number(data?.clientSentAt ?? 0),
            serverTimestamp,
            serverTime: new Date(serverTimestamp).toISOString(),
        };
    }
    resync(client, data) {
        if (!this.allowEvent(client, 'resync', 750)) {
            return {
                event: websockets_events_1.WebsocketEvents.ERROR,
                message: 'Resync requests are rate limited.',
            };
        }
        this.metrics.increment('resync_requests');
        const symbol = this.normalizeSymbol(data?.symbol);
        const timeframe = (0, timeframe_config_1.normalizeTimeframe)(data?.timeframe);
        const result = this.marketDataService.getCandles({
            asset: symbol,
            timeframe,
            limit: Math.min(Math.max(Number(data?.limit ?? 320), 60), 420),
        });
        return {
            event: websockets_events_1.WebsocketEvents.RESYNC_RESPONSE,
            symbol,
            timeframe,
            requestedSince: Number(data?.since ?? 0),
            lastSequence: Number(this.marketDataService.getTick(symbol).sequence ?? 0),
            serverTimestamp: Date.now(),
            candles: result.candles.filter((candle) => !data?.since || candle.time >= Number(data.since)),
        };
    }
    clientMetrics(client, data) {
        if (!this.allowEvent(client, 'metrics', 1_000)) {
            return { ok: false, rateLimited: true, serverTimestamp: Date.now() };
        }
        const tickAgeMs = Number(data?.tickAgeMs);
        const renderDelayMs = Number(data?.renderDelayMs);
        if (Number.isFinite(tickAgeMs) && tickAgeMs >= 0 && tickAgeMs < 60_000) {
            this.metrics.observe('client_tick_age_ms', tickAgeMs);
        }
        if (Number.isFinite(renderDelayMs) &&
            renderDelayMs >= 0 &&
            renderDelayMs < 60_000) {
            this.metrics.observe('client_render_delay_ms', renderDelayMs);
        }
        if (data?.reconnect)
            this.metrics.increment('reconnect_count');
        if (typeof data?.transport === 'string') {
            this.metrics.observeTransport(data.transport);
        }
        return { ok: true, serverTimestamp: Date.now() };
    }
    broadcastPriceUpdate(dto) {
        this.server
            .to(this.symbolRoom(dto.symbol))
            .volatile.emit(websockets_events_1.WebsocketEvents.PRICE_UPDATE, dto);
    }
    broadcastCandleUpdate(dto) {
        this.server
            .to(this.chartRoom(dto.symbol, dto.timeframe))
            .emit(websockets_events_1.WebsocketEvents.CANDLE_UPDATE, dto);
    }
    symbolRoom(symbol) {
        return `symbol:${symbol}`;
    }
    chartRoom(symbol, timeframe) {
        return `chart:${symbol}:${timeframe}`;
    }
    isWatched(symbol) {
        const now = Date.now();
        if (now - this.watchedCheckedAt > 250) {
            this.watchedCheckedAt = now;
            const next = new Set();
            for (const room of this.server?.adapter?.rooms?.keys() ?? []) {
                if (room.startsWith('symbol:'))
                    next.add(room.slice(7));
                else if (room.startsWith('chart:')) {
                    next.add(room.slice(6, room.lastIndexOf(':')));
                }
            }
            this.watched = next;
        }
        return this.watched.has(symbol);
    }
    roomSize(room) {
        return this.server.adapter.rooms.get(room)?.size ?? 0;
    }
    allowEvent(client, key, minIntervalMs) {
        const rateLimits = client.data.marketRateLimits ?? {};
        const now = Date.now();
        const previous = rateLimits[key] ?? 0;
        if (now - previous < minIntervalMs)
            return false;
        rateLimits[key] = now;
        client.data.marketRateLimits = rateLimits;
        return true;
    }
    normalizeSymbol(value) {
        const normalized = String(value ?? '').trim().toLowerCase();
        const asset = market_data_constants_1.MARKET_ASSETS.find((candidate) => candidate.isActive && candidate.symbol.toLowerCase() === normalized);
        if (!asset) {
            throw new Error('Unsupported or inactive market symbol.');
        }
        return asset.symbol;
    }
};
exports.MarketGateway = MarketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Namespace)
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
__decorate([
    (0, websockets_1.SubscribeMessage)(websockets_events_1.WebsocketEvents.SERVER_TIME),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "serverTime", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(websockets_events_1.WebsocketEvents.RESYNC_REQUEST),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "resync", null);
__decorate([
    (0, websockets_1.SubscribeMessage)(websockets_events_1.WebsocketEvents.CLIENT_METRICS),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "clientMetrics", null);
exports.MarketGateway = MarketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'market',
        cors: {
            origin: process.env.WEBSOCKET_ORIGIN
                ? process.env.WEBSOCKET_ORIGIN.split(',').map((value) => value.trim())
                : '*',
        },
        pingInterval: 10_000,
        pingTimeout: 5_000,
        maxHttpBufferSize: 100_000,
    }),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService,
        latency_metrics_service_1.LatencyMetricsService])
], MarketGateway);
//# sourceMappingURL=market.gateway.js.map