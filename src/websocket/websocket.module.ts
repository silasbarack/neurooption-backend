import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TradingGateway } from './trading.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (c: ConfigService) => ({ secret: c.get('JWT_SECRET', 'neurooption-secret-key') }),
      inject: [ConfigService],
    }),
  ],
  providers: [TradingGateway],
  exports: [TradingGateway],
})
export class WebsocketModule {}
