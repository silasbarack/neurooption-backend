import { Server, Socket } from 'socket.io';
import { TradeUpdateDto } from './dto/trade-update.dto';
import { WebsocketEvents } from './websockets-events';

declare const require: any;

interface OnGatewayConnection {}
interface OnGatewayDisconnect {}

const noOpDecorator = () => () => {};

let ConnectedSocket: any = noOpDecorator;
let MessageBody: any = noOpDecorator;
let SubscribeMessage: any = noOpDecorator;
let WebSocketGateway: any = noOpDecorator;
let WebSocketServer: any = noOpDecorator;

try {
  const nestWebsockets = require('@nestjs/websockets');

  ConnectedSocket = nestWebsockets.ConnectedSocket ?? ConnectedSocket;
  MessageBody = nestWebsockets.MessageBody ?? MessageBody;
  SubscribeMessage = nestWebsockets.SubscribeMessage ?? SubscribeMessage;
  WebSocketGateway = nestWebsockets.WebSocketGateway ?? WebSocketGateway;
  WebSocketServer = nestWebsockets.WebSocketServer ?? WebSocketServer;
} catch {}

@WebSocketGateway({
  namespace: 'trading',
  cors: {
    origin: '*',
  },
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
    server!: Server;

  handleConnection(client: Socket) {
    client.emit(WebsocketEvents.CONNECTED, {
      message: 'Connected to NeuroOption trading websocket',
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Trading socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_user_room')
  joinUserRoom(client: Socket, data: { userId: string }) {
    client.join(this.getUserRoom(data.userId));

    return {
      event: 'join_user_room',
      message: `Joined user room ${data.userId}`,
    };
  }

  @SubscribeMessage('leave_user_room')
  leaveUserRoom(client: Socket, data: { userId: string }) {
    client.leave(this.getUserRoom(data.userId));

    return {
      event: 'leave_user_room',
      message: `Left user room ${data.userId}`,
    };
  }

  emitTradeOpened(userId: string, trade: any) {
    this.server.to(this.getUserRoom(userId)).emit(WebsocketEvents.TRADE_OPENED, {
      userId,
      trade,
      timestamp: new Date(),
    });
  }

  emitTradeSettled(dto: TradeUpdateDto) {
    this.server
      .to(this.getUserRoom(dto.userId))
      .emit(WebsocketEvents.TRADE_SETTLED, {
        ...dto,
        timestamp: new Date(),
      });
  }

  emitTradeCancelled(userId: string, tradeId: string) {
    this.server
      .to(this.getUserRoom(userId))
      .emit(WebsocketEvents.TRADE_CANCELLED, {
        userId,
        tradeId,
        timestamp: new Date(),
      });
  }

  emitWalletUpdate(userId: string, wallet: any) {
    this.server
      .to(this.getUserRoom(userId))
      .emit(WebsocketEvents.WALLET_UPDATE, {
        userId,
        wallet,
        timestamp: new Date(),
      });
  }

  emitDepositUpdate(userId: string, deposit: any) {
    this.server
      .to(this.getUserRoom(userId))
      .emit(WebsocketEvents.DEPOSIT_UPDATE, {
        userId,
        deposit,
        timestamp: new Date(),
      });
  }

  emitWithdrawalUpdate(userId: string, withdrawal: any) {
    this.server
      .to(this.getUserRoom(userId))
      .emit(WebsocketEvents.WITHDRAWAL_UPDATE, {
        userId,
        withdrawal,
        timestamp: new Date(),
      });
  }

  emitPayoutUpdate(userId: string, payout: any) {
    this.server
      .to(this.getUserRoom(userId))
      .emit(WebsocketEvents.PAYOUT_UPDATE, {
        userId,
        payout,
        timestamp: new Date(),
      });
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }
}