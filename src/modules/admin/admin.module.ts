import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Trade } from '../trading/trade.entity';
import { Transaction } from '../wallet/transaction.entity';
import { WalletModule } from '../wallet/wallet.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trade, Transaction]),
    WalletModule,
    WebsocketModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
