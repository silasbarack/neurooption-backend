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
const admin_guard_1 = require("../auth/admin.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const confirm_deposit_dto_1 = require("./dto/confirm-deposit.dto");
const mark_withdrawal_paid_dto_1 = require("./dto/mark-withdrawal-paid.dto");
const place_trade_dto_1 = require("./dto/place-trade.dto");
const reject_withdrawal_dto_1 = require("./dto/reject-withdrawal.dto");
const request_withdrawal_dto_1 = require("./dto/request-withdrawal.dto");
const settle_trade_lost_dto_1 = require("./dto/settle-trade-lost.dto");
const settle_trade_won_dto_1 = require("./dto/settle-trade-won.dto");
const ledger_service_1 = require("./ledger.service");
const ledger_types_1 = require("./ledger.types");
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
    confirmDeposit(dto) {
        return this.ledgerService.confirmDeposit({
            ...dto,
            clearingAccountCode: ledger_types_1.PROVIDER_CLEARING_ACCOUNT_CODE[dto.provider],
        });
    }
    requestWithdrawal(dto) {
        return this.ledgerService.requestWithdrawal(dto);
    }
    markWithdrawalPaid(dto) {
        return this.ledgerService.markWithdrawalPaid({
            ...dto,
            clearingAccountCode: ledger_types_1.PROVIDER_CLEARING_ACCOUNT_CODE[dto.provider],
        });
    }
    rejectWithdrawal(dto) {
        return this.ledgerService.rejectWithdrawal(dto);
    }
    placeTrade(dto) {
        return this.ledgerService.placeTrade(dto);
    }
    settleTradeWon(dto) {
        return this.ledgerService.settleTradeWon(dto);
    }
    settleTradeLost(dto) {
        return this.ledgerService.settleTradeLost(dto);
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
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/confirm-deposit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [confirm_deposit_dto_1.ConfirmDepositDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "confirmDeposit", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/request-withdrawal'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_withdrawal_dto_1.RequestWithdrawalDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "requestWithdrawal", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/mark-withdrawal-paid'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mark_withdrawal_paid_dto_1.MarkWithdrawalPaidDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "markWithdrawalPaid", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/reject-withdrawal'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reject_withdrawal_dto_1.RejectWithdrawalDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "rejectWithdrawal", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/place-trade'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_trade_dto_1.PlaceTradeDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "placeTrade", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/settle-trade-won'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settle_trade_won_dto_1.SettleTradeWonDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "settleTradeWon", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('dev/settle-trade-lost'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settle_trade_lost_dto_1.SettleTradeLostDto]),
    __metadata("design:returntype", void 0)
], LedgerController.prototype, "settleTradeLost", null);
exports.LedgerController = LedgerController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ledger'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map