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
exports.TradingEngineController = void 0;
const common_1 = require("@nestjs/common");
const trading_engine_service_1 = require("./trading-engine.service");
const place_trade_dto_1 = require("./dto/place-trade.dto");
let TradingEngineController = class TradingEngineController {
    constructor(tradingEngineService) {
        this.tradingEngineService = tradingEngineService;
    }
    placeTrade(dto) {
        return this.tradingEngineService.placeTrade(dto);
    }
    settleTrade(tradeId) {
        return this.tradingEngineService.settleTrade(tradeId);
    }
    getOpenTrades(userId = 'demo-user') {
        return this.tradingEngineService.getOpenTrades(userId);
    }
    getTradeHistory(userId = 'demo-user') {
        return this.tradingEngineService.getTradeHistory(userId);
    }
    getAllTrades(userId = 'demo-user') {
        return this.tradingEngineService.getAllTrades(userId);
    }
    getWallet(userId = 'demo-user', accountType = 'QT Demo', currency = 'USD') {
        return this.tradingEngineService.getWallet(userId, accountType, currency);
    }
    getTransactions(userId = 'demo-user') {
        return this.tradingEngineService.getTransactions(userId);
    }
};
exports.TradingEngineController = TradingEngineController;
__decorate([
    (0, common_1.Post)('trades'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [place_trade_dto_1.PlaceTradeDto]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "placeTrade", null);
__decorate([
    (0, common_1.Post)('trades/:tradeId/settle'),
    __param(0, (0, common_1.Param)('tradeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "settleTrade", null);
__decorate([
    (0, common_1.Get)('trades/open'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getOpenTrades", null);
__decorate([
    (0, common_1.Get)('trades/history'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getTradeHistory", null);
__decorate([
    (0, common_1.Get)('trades'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getAllTrades", null);
__decorate([
    (0, common_1.Get)('wallet'),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('accountType')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getTransactions", null);
exports.TradingEngineController = TradingEngineController = __decorate([
    (0, common_1.Controller)('trading-engine'),
    __metadata("design:paramtypes", [trading_engine_service_1.TradingEngineService])
], TradingEngineController);
//# sourceMappingURL=trading-engine.controller.js.map