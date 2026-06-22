import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { WebsocketEvents } from './websockets-events';

export type MarketPriceUpdate = {
  symbol: string;
  price: number;
  time: number;
  serverTime: string;
};

export type MarketCandleUpdate = {
  symbol: string;
  timeframe: string;
  candle: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
};

@WebSocketGateway({
  namespace: 'market',
  cors: {
    origin: '*',
  },
})
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Namespace;

  handleConnection(client: Socket) {
    client.emit(WebsocketEvents.CONNECTED, {
      message: 'Connected to NeuroOption market websocket',
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Market socket disconnected: ${client.id}`);
  }

  @SubscribeMessage(WebsocketEvents.SUBSCRIBE_SYMBOL)
  subscribeSymbol(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; timeframe?: string },
  ) {
    const symbolRoom = this.symbolRoom(data.symbol);
    client.join(symbolRoom);

    if (data.timeframe) {
      client.join(this.chartRoom(data.symbol, data.timeframe));
    }

    return {
      event: WebsocketEvents.SUBSCRIBE_SYMBOL,
      message: `Subscribed to ${data.symbol}`,
    };
  }

  @SubscribeMessage(WebsocketEvents.UNSUBSCRIBE_SYMBOL)
  unsubscribeSymbol(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; timeframe?: string },
  ) {
    client.leave(this.symbolRoom(data.symbol));

    if (data.timeframe) {
      client.leave(this.chartRoom(data.symbol, data.timeframe));
    }

    return {
      event: WebsocketEvents.UNSUBSCRIBE_SYMBOL,
      message: `Unsubscribed from ${data.symbol}`,
    };
  }

  broadcastPriceUpdate(dto: MarketPriceUpdate) {
    this.server.to(this.symbolRoom(dto.symbol)).emit(WebsocketEvents.PRICE_UPDATE, dto);
  }

  broadcastCandleUpdate(dto: MarketCandleUpdate) {
    this.server
      .to(this.chartRoom(dto.symbol, dto.timeframe))
      .emit(WebsocketEvents.CANDLE_UPDATE, dto);
  }

  symbolRoom(symbol: string) {
    return `symbol:${symbol}`;
  }

  chartRoom(symbol: string, timeframe: string) {
    return `chart:${symbol}:${timeframe}`;
  }

  roomSize(room: string) {
    return this.server.adapter.rooms.get(room)?.size ?? 0;
  }
}