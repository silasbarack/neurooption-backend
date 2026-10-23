import { Module } from '@nestjs/common';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TradingModule } from './modules/trading/trading.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { AssetsModule } from './modules/assets/assets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SignalsModule } from './modules/signals/signals.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { SocialTradingModule } from './modules/social-trading/social-trading.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        // Dev auto-syncs the schema from entities; production applies versioned migrations instead.
        const synchronize = config.get('DB_SYNCHRONIZE') != null
          ? config.get('DB_SYNCHRONIZE') === 'true'
          : config.get('NODE_ENV') !== 'production';
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5432)),
          username: config.get('DB_USER', 'neurooption'),
          password: config.get('DB_PASS', 'password'),
          database: config.get('DB_NAME', 'neurooption'),
          autoLoadEntities: true,
          synchronize,
          migrations: [join(__dirname, 'migrations', '*.js')],
          migrationsRun: !synchronize,
          logging: config.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    MailModule,
    AuthModule,
    UsersModule,
    TradingModule,
    MarketDataModule,
    AssetsModule,
    PaymentsModule,
    SignalsModule,
    LeaderboardModule,
    SocialTradingModule,
    WebsocketModule,
    AuditModule,
    NotificationsModule,
  ],
})
export class AppModule {}
