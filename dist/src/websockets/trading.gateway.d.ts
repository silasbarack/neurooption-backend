import { Server, Socket } from 'socket.io';
import { TradeUpdateDto } from './dto/trade-update.dto';
interface OnGatewayConnection {
}
interface OnGatewayDisconnect {
}
export declare class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    joinUserRoom(client: Socket, data: {
        userId: string;
    }): {
        event: string;
        message: string;
    };
    leaveUserRoom(client: Socket, data: {
        userId: string;
    }): {
        event: string;
        message: string;
    };
    emitTradeOpened(userId: string, trade: any): void;
    emitTradeSettled(dto: TradeUpdateDto): void;
    emitTradeCancelled(userId: string, tradeId: string): void;
    emitWalletUpdate(userId: string, wallet: any): void;
    emitDepositUpdate(userId: string, deposit: any): void;
    emitWithdrawalUpdate(userId: string, withdrawal: any): void;
    emitPayoutUpdate(userId: string, payout: any): void;
    private getUserRoom;
}
export {};
