import { Module } from '@nestjs/common';
import { SocialTradingController } from './social-trading.controller';
@Module({ controllers: [SocialTradingController] })
export class SocialTradingModule {}
