import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { paymentConfig } from './payment.config';
import { websocketConfig } from './websocket.config';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        paymentConfig,
        websocketConfig,
      ],
    }),
    PrismaModule,
  ],
  exports: [PrismaModule],
})
export class AppConfigModule {}