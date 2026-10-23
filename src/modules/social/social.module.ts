import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { UsersModule } from '../users/users.module';
import { TradingModule } from '../trading/trading.module';

@Module({
  imports: [UsersModule, TradingModule],
  providers: [SocialService],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
