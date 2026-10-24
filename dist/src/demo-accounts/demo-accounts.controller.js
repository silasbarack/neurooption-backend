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
exports.DemoAccountsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const switch_account_currency_dto_1 = require("../trading-accounts/dto/switch-account-currency.dto");
const demo_accounts_service_1 = require("./demo-accounts.service");
let DemoAccountsController = class DemoAccountsController {
    constructor(service) {
        this.service = service;
    }
    assertSelf(req, userId) {
        if (req.user?.id !== userId)
            throw new common_1.ForbiddenException('You can only access your own account.');
    }
    create(req, userId, currency) {
        this.assertSelf(req, userId);
        return this.service.create(userId, currency);
    }
    findByUser(req, userId) {
        this.assertSelf(req, userId);
        return this.service.findByUser(userId);
    }
    switchCurrency(req, userId, dto) {
        this.assertSelf(req, userId);
        return this.service.switchCurrency(userId, dto);
    }
    async reset(req, accountId) {
        await this.service.assertOwnedBy(accountId, req.user.id);
        return this.service.reset(accountId);
    }
};
exports.DemoAccountsController = DemoAccountsController;
__decorate([
    (0, common_1.Post)(':userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], DemoAccountsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DemoAccountsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Patch)('user/:userId/switch-currency'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, switch_account_currency_dto_1.SwitchAccountCurrencyDto]),
    __metadata("design:returntype", void 0)
], DemoAccountsController.prototype, "switchCurrency", null);
__decorate([
    (0, common_1.Patch)(':accountId/reset'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DemoAccountsController.prototype, "reset", null);
exports.DemoAccountsController = DemoAccountsController = __decorate([
    (0, common_1.Controller)('demo-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [demo_accounts_service_1.DemoAccountsService])
], DemoAccountsController);
//# sourceMappingURL=demo-accounts.controller.js.map