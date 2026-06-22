import { Module } from '@nestjs/common';
import { MarketDataModule } from '../market-data/market-data.module';
import { MarketGateway } from './market.gateway';
import { MarketTickerService } from './market-ticker.service';

@Module({
  imports: [MarketDataModule],
  providers: [MarketGateway, MarketTickerService],
})
export class WebsocketsModule {}
