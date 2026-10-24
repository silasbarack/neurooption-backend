"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const trading_accounts_module_1 = require("../trading-accounts/trading-accounts.module");
const real_accounts_controller_1 = require("./real-accounts.controller");
const real_accounts_service_1 = require("./real-accounts.service");
let RealAccountsModule = class RealAccountsModule {
};
exports.RealAccountsModule = RealAccountsModule;
exports.RealAccountsModule = RealAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [trading_accounts_module_1.TradingAccountsModule],
        controllers: [real_accounts_controller_1.RealAccountsController],
        providers: [real_accounts_service_1.RealAccountsService],
        exports: [real_accounts_service_1.RealAccountsService],
    })
], RealAccountsModule);
//# sourceMappingURL=real-accounts.module.js.map