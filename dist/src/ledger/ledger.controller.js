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
exports.LedgerController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ledger_service_1 = require("./ledger.service");
let LedgerController = class LedgerController {
    constructor(ledgerService) {
        this.ledgerService = ledgerService;
    }
    assertCanReadUser(req, userId) {
        if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only view your own ledger');
        }
    }
    async getBalance(req, userId, currency = client_1.AccountCurrency.USD) {
        this.assertCanReadUser(req, userId);
        const balance = await this.ledgerService.getUserAvailableBalance(userId, currency);
        return {
            userId,
            currency,
            availableBalance: balance.toFixed(2),
        };
    }
    async getStatement(req, userId, currency = client_1.AccountCurrency.USD) {
        this.assertCanReadUser(req, userId);
        const entries = await this.ledgerService.getUserStatement(userId, currency);
        return entries.map((entry) => ({
            id: entry.id,
            accountCode: entry.account.code,
            side: entry.side,
            amount: entry.amount.toFixed(2),
            currency: entry.currency,
            memo: entry.memo,
            transactionType: entry.transaction.type,
            transactionDescription: entry.transaction.description,
            createdAt: entry.createdAt,
        }));
    }
};
exports.LedgerController = LedgerController;
__decorate([
    (0, common_1.Get)('balance/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('statement/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getStatement", null);
exports.LedgerController = LedgerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ledger'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map