// @ts-ignore: module may not be installed in this environment
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PriceUpdateDto } from './dto/price-update.dto';
import { CandleUpdateDto } from './dto/candle-update.dto';
import { WebsocketEvents } from './websockets-events';

@WebSocketGateway({
  namespace: 'market',
  cors: {
    origin: '*',
  },
})
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

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
    const symbolRoom = this.getSymbolRoom(data.symbol);
    client.join(symbolRoom);

    if (data.timeframe) {
      client.join(this.getChartRoom(data.symbol, data.timeframe));
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
    client.leave(this.getSymbolRoom(data.symbol));

    if (data.timeframe) {
      client.leave(this.getChartRoom(data.symbol, data.timeframe));
    }

    return {
      event: WebsocketEvents.UNSUBSCRIBE_SYMBOL,
      message: `Unsubscribed from ${data.symbol}`,
    };
  }

  broadcastPriceUpdate(dto: PriceUpdateDto) {
    this.server
      .to(this.getSymbolRoom(dto.symbol))
      .emit(WebsocketEvents.PRICE_UPDATE, dto);
  }

  broadcastCandleUpdate(dto: CandleUpdateDto) {
    this.server
      .to(this.getChartRoom(dto.symbol, dto.timeframe))
      .emit(WebsocketEvents.CANDLE_UPDATE, dto);
  }

  broadcastChartUpdate(symbol: string, timeframe: string, chartData: any) {
    this.server
      .to(this.getChartRoom(symbol, timeframe))
      .emit(WebsocketEvents.CHART_UPDATE, {
        symbol,
        timeframe,
        data: chartData,
        timestamp: new Date(),
      });
  }

  private getSymbolRoom(symbol: string) {
    return `symbol:${symbol}`;
  }

  private getChartRoom(symbol: string, timeframe: string) {
    return `chart:${symbol}:${timeframe}`;
  }
}