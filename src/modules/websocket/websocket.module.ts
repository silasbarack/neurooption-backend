import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketGateway } from './websocket.gateway';
import { MarketsModule } from '../markets/markets.module';
import { SignalsModule } from '../signals/signals.module';

@Module({
  imports: [
    MarketsModule,
    SignalsModule,
    JwtModule.register({ secret: process.env.JWT_SECRET || 'neurooption_jwt_secret' }),
  ],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
