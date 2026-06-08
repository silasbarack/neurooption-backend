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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingAccountsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const create_trading_account_dto_1 = require("./dto/create-trading-account.dto");
const switch_account_currency_dto_1 = require("./dto/switch-account-currency.dto");
const update_trading_account_dto_1 = require("./dto/update-trading-account.dto");
const trading_accounts_service_1 = require("./trading-accounts.service");
let TradingAccountsController = class TradingAccountsController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    createDefaultAccounts(userId) {
        return this.service.createDefaultAccounts(userId);
    }
    findAll() {
        return this.service.findAll();
    }
    findByUser(userId) {
        return this.service.findByUser(userId);
    }
    findByUserAndType(userId, type) {
        return this.service.findByUserAndType(userId, type);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    resetDemoAccount(id) {
        return this.service.resetDemoAccount(id);
    }
    switchCurrency(userId, type, dto) {
        return this.service.switchCurrency(userId, type, dto);
    }
};
exports.TradingAccountsController = TradingAccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trading_account_dto_1.CreateTradingAccountDto]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('default/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "createDefaultAccounts", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('user/:userId/type/:type'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "findByUserAndType", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_trading_account_dto_1.UpdateTradingAccountDto]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/reset-demo'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "resetDemoAccount", null);
__decorate([
    (0, common_1.Patch)('user/:userId/:type/switch-currency'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, switch_account_currency_dto_1.SwitchAccountCurrencyDto]),
    __metadata("design:returntype", void 0)
], TradingAccountsController.prototype, "switchCurrency", null);
exports.TradingAccountsController = TradingAccountsController = __decorate([
    (0, common_1.Controller)('trading-accounts'),
    __metadata("design:paramtypes", [trading_accounts_service_1.TradingAccountsService])
], TradingAccountsController);
//# sourceMappingURL=trading-accounts.controller.js.map