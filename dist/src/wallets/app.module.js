"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const assets_module_1 = require("./assets/assets.module");
const auth_module_1 = require("./auth/auth.module");
const prisma_service_1 = require("./common/prisma.service");
const health_controller_1 = require("./health/health.controller");
const admin_module_1 = require("./admin/admin.module");
const profile_module_1 = require("./profile/profile.module");
const candles_module_1 = require("./candles/candles.module");
const charts_module_1 = require("./charts/charts.module");
const timeframes_module_1 = require("./timeframes/timeframes.module");
const market_data_module_1 = require("./market-data/market-data.module");
const indicators_module_1 = require("./indicators/indicators.module");
const config_module_1 = require("./config/config.module");
const otc_markets_module_1 = require("./otc-markets/otc-markets.module");
const real_markets_module_1 = require("./real-markets/real-markets.module");
const support_module_1 = require("./support/support.module");
const trading_engine_module_1 = require("./trading-engine/trading-engine.module");
const trades_module_1 = require("./trades/trades.module");
const kyc_module_1 = require("./kyc/kyc.module");
const expiries_module_1 = require("./expiries/expiries.module");
const emails_module_1 = require("./emails/emails.module");
const notifications_module_1 = require("./notifications/notifications.module");
const transactions_module_1 = require("./transactions/transactions.module");
const users_module_1 = require("./users/users.module");
const wallets_module_1 = require("./wallets/wallets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            assets_module_1.AssetsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            wallets_module_1.WalletsModule,
            notifications_module_1.NotificationsModule,
            transactions_module_1.TransactionsModule,
            kyc_module_1.KycModule,
            support_module_1.SupportModule,
            emails_module_1.EmailsModule,
            profile_module_1.ProfileModule,
            admin_module_1.AdminModule,
            trading_engine_module_1.TradingEngineModule,
            trades_module_1.TradesModule,
            timeframes_module_1.TimeframesModule,
            expiries_module_1.ExpiriesModule,
            market_data_module_1.MarketDataModule,
            otc_markets_module_1.OtcMarketsModule,
            real_markets_module_1.RealMarketsModule,
            charts_module_1.ChartsModule,
            candles_module_1.CandlesModule,
            indicators_module_1.IndicatorsModule,
            config_module_1.AppConfigModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map