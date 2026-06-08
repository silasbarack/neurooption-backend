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
exports.RealAccountsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const switch_account_currency_dto_1 = require("../trading-accounts/dto/switch-account-currency.dto");
const real_accounts_service_1 = require("./real-accounts.service");
let RealAccountsController = class RealAccountsController {
    constructor(service) {
        this.service = service;
    }
    create(userId, currency) {
        return this.service.create(userId, currency);
    }
    findByUser(userId) {
        return this.service.findByUser(userId);
    }
    switchCurrency(userId, dto) {
        return this.service.switchCurrency(userId, dto);
    }
};
exports.RealAccountsController = RealAccountsController;
__decorate([
    (0, common_1.Post)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RealAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RealAccountsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Patch)('user/:userId/switch-currency'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, switch_account_currency_dto_1.SwitchAccountCurrencyDto]),
    __metadata("design:returntype", void 0)
], RealAccountsController.prototype, "switchCurrency", null);
exports.RealAccountsController = RealAccountsController = __decorate([
    (0, common_1.Controller)('real-accounts'),
    __metadata("design:paramtypes", [real_accounts_service_1.RealAccountsService])
], RealAccountsController);
//# sourceMappingURL=real-accounts.controller.js.map