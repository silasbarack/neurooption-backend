import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PriceUpdateDto } from './dto/price-update.dto';
import { CandleUpdateDto } from './dto/candle-update.dto';
export declare class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
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
    broadcastPriceUpdate(dto: PriceUpdateDto): void;
    broadcastCandleUpdate(dto: CandleUpdateDto): void;
    broadcastChartUpdate(symbol: string, timeframe: string, chartData: any): void;
    private getSymbolRoom;
    private getChartRoom;
}
