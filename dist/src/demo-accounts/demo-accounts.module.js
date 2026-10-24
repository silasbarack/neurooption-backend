"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const trading_accounts_module_1 = require("../trading-accounts/trading-accounts.module");
const demo_accounts_controller_1 = require("./demo-accounts.controller");
const demo_accounts_service_1 = require("./demo-accounts.service");
let DemoAccountsModule = class DemoAccountsModule {
};
exports.DemoAccountsModule = DemoAccountsModule;
exports.DemoAccountsModule = DemoAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [trading_accounts_module_1.TradingAccountsModule],
        controllers: [demo_accounts_controller_1.DemoAccountsController],
        providers: [demo_accounts_service_1.DemoAccountsService],
        exports: [demo_accounts_service_1.DemoAccountsService],
    })
], DemoAccountsModule);
//# sourceMappingURL=demo-accounts.module.js.map