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
exports.TradingEngineController = exports.GUEST_USER_ID = void 0;
const common_1 = require("@nestjs/common");
const optional_jwt_auth_guard_1 = require("../auth/optional-jwt-auth.guard");
const trading_engine_service_1 = require("./trading-engine.service");
const place_trade_dto_1 = require("./dto/place-trade.dto");
const trading_engine_types_1 = require("./trading-engine.types");
exports.GUEST_USER_ID = 'demo-user';
function resolveUserId(req, accountType) {
    const userId = req.user?.id;
    if (userId)
        return userId;
    if (accountType === 'QT Real') {
        throw new common_1.UnauthorizedException('Sign in to trade with your real account.');
    }
    return exports.GUEST_USER_ID;
}
let TradingEngineController = class TradingEngineController {
    constructor(tradingEngineService) {
        this.tradingEngineService = tradingEngineService;
    }
    placeTrade(req, dto) {
        const userId = resolveUserId(req, dto.accountType);
        return this.tradingEngineService.placeTrade({ ...dto, userId });
    }
    settleTrade(req, tradeId) {
        return this.tradingEngineService.settleTradeForUser(tradeId, resolveUserId(req));
    }
    getOpenTrades(req) {
        return this.tradingEngineService.getOpenTrades(resolveUserId(req));
    }
    getTradeHistory(req) {
        return this.tradingEngineService.getTradeHistory(resolveUserId(req));
    }
    getAllTrades(req) {
        return this.tradingEngineService.getAllTrades(resolveUserId(req));
    }
    getWallet(req, accountType = 'QT Demo', currency = 'USD') {
        const userId = resolveUserId(req, accountType);
        return this.tradingEngineService.getWallet(userId, accountType, currency);
    }
    topUpDemo(req, amount, currency = 'USD') {
        if (!trading_engine_types_1.ACCOUNT_CURRENCIES.includes(currency)) {
            throw new common_1.BadRequestException('Unsupported currency.');
        }
        const userId = resolveUserId(req, 'QT Demo');
        return this.tradingEngineService.topUpDemo(userId, Number(amount), currency);
    }
    getTransactions(req) {
        return this.tradingEngineService.getTransactions(resolveUserId(req));
    }
};
exports.TradingEngineController = TradingEngineController;
__decorate([
    (0, common_1.Post)('trades'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, place_trade_dto_1.PlaceTradeDto]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "placeTrade", null);
__decorate([
    (0, common_1.Post)('trades/:tradeId/settle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('tradeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "settleTrade", null);
__decorate([
    (0, common_1.Get)('trades/open'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getOpenTrades", null);
__decorate([
    (0, common_1.Get)('trades/history'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getTradeHistory", null);
__decorate([
    (0, common_1.Get)('trades'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getAllTrades", null);
__decorate([
    (0, common_1.Get)('wallet'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('accountType')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('demo/top-up'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "topUpDemo", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getTransactions", null);
exports.TradingEngineController = TradingEngineController = __decorate([
    (0, common_1.Controller)('trading-engine'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __metadata("design:paramtypes", [trading_engine_service_1.TradingEngineService])
], TradingEngineController);
//# sourceMappingURL=trading-engine.controller.js.map