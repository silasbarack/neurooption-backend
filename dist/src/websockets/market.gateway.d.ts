import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
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
export declare class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Namespace;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    subscribeSymbol(client: Socket, data: {
        symbol: string;
        timeframe?: string;
    }): {
        event: string;
        message: string;
    };
    unsubscribeSymbol(client: Socket, data: {
        symbol: string;
        timeframe?: string;
    }): {
        event: string;
        message: string;
    };
    broadcastPriceUpdate(dto: MarketPriceUpdate): void;
    broadcastCandleUpdate(dto: MarketCandleUpdate): void;
    symbolRoom(symbol: string): string;
    chartRoom(symbol: string, timeframe: string): string;
    roomSize(room: string): number;
}
