"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingEngineModule = void 0;
const common_1 = require("@nestjs/common");
const market_data_module_1 = require("../market-data/market-data.module");
const wallets_module_1 = require("../wallets/wallets.module");
const transactions_module_1 = require("../transactions/transactions.module");
const trades_module_1 = require("../trades/trades.module");
const ledger_module_1 = require("../ledger/ledger.module");
const trading_engine_controller_1 = require("./trading-engine.controller");
const trading_engine_service_1 = require("./trading-engine.service");
let TradingEngineModule = class TradingEngineModule {
};
exports.TradingEngineModule = TradingEngineModule;
exports.TradingEngineModule = TradingEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            market_data_module_1.MarketDataModule,
            wallets_module_1.WalletsModule,
            transactions_module_1.TransactionsModule,
            trades_module_1.TradesModule,
            ledger_module_1.LedgerModule,
        ],
        controllers: [trading_engine_controller_1.TradingEngineController],
        providers: [trading_engine_service_1.TradingEngineService],
        exports: [trading_engine_service_1.TradingEngineService],
    })
], TradingEngineModule);
//# sourceMappingURL=trading-engine.module.js.map