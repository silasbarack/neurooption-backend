import { Module } from '@nestjs/common';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './common/prisma.service';
import { HealthController } from './health/health.controller';
import { AdminModule } from './admin/admin.module';
import { ProfileModule } from './profile/profile.module';
import { CandlesModule } from './candles/candles.module';
import { ChartsModule } from './charts/charts.module';
import { SocialTradingModule } from './social-trading/social-trading.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { TimeframesModule } from './timeframes/timeframes.module';
import { MarketDataModule } from './market-data/market-data.module';
import {IndicatorsModule} from "./indicators/indicators.module";
import { TradingAccountsModule } from './trading-accounts/trading-accounts.module';
import { AppConfigModule } from './config/config.module';
import { DemoAccountsModule } from './demo-accounts/demo-accounts.module';
import { RealAccountsModule } from './real-accounts/real-accounts.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { PayoutsModule } from './payouts/payouts.module';
import { OtcMarketsModule } from './otc-markets/otc-markets.module';
import { RealMarketsModule } from './real-markets/real-markets.module';
import { SupportModule } from './support/support.module';
import { TradingEngineModule } from './trading-engine/trading-engine.module';
import { TradesModule } from './trades/trades.module';
import { DepositsModule } from './deposits/deposits.module';
import { KycModule } from './kyc/kyc.module';
import { ExpiriesModule } from './expiries/expiries.module';
import { PaymentGatewaysModule } from './payment-gateways/payment-gateways.module'; 
import { EmailsModule } from './emails/emails.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { LedgerModule } from './ledger/ledger.module';

@Module({
  imports: [
    AssetsModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    NotificationsModule,
    TransactionsModule,
    KycModule,
    SupportModule,
    EmailsModule,
    ProfileModule,
    AdminModule,
    TradingEngineModule,
    TradesModule,
    TimeframesModule,
    ExpiriesModule,
    MarketDataModule,
    OtcMarketsModule,
    RealMarketsModule,
    ChartsModule,
    CandlesModule,
    IndicatorsModule,
    AppConfigModule,
    PaymentGatewaysModule,
    DepositsModule,
    WithdrawalsModule,
    PayoutsModule,
    SocialTradingModule,
    AuditLogsModule,
    AffiliatesModule,
    TradingAccountsModule,
    RealAccountsModule,
    DemoAccountsModule,
    WebsocketsModule,
    LedgerModule,

  ],
  
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}