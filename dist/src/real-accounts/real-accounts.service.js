"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealAccountsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const trading_accounts_service_1 = require("../trading-accounts/trading-accounts.service");
let RealAccountsService = class RealAccountsService {
    constructor(tradingAccountsService) {
        this.tradingAccountsService = tradingAccountsService;
    }
    create(userId, currency = client_1.AccountCurrency.KES) {
        return this.tradingAccountsService.create({
            userId,
            type: client_1.AccountType.REAL,
            currency,
        });
    }
    findByUser(userId) {
        return this.tradingAccountsService.findByUserAndType(userId, client_1.AccountType.REAL);
    }
    switchCurrency(userId, dto) {
        return this.tradingAccountsService.switchCurrency(userId, client_1.AccountType.REAL, dto);
    }
};
exports.RealAccountsService = RealAccountsService;
exports.RealAccountsService = RealAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [trading_accounts_service_1.TradingAccountsService])
], RealAccountsService);
//# sourceMappingURL=real-accounts.service.js.map