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
let TradingEngineController = class TradingEngineController {
    constructor(tradingEngineService) {
        this.tradingEngineService = tradingEngineService;
    }
    getWallet(query) {
        return this.tradingEngineService.getWallet(query);
    }
    openTrade(body) {
        return this.tradingEngineService.getOpenTrades(body);
    }
    getOpenTrades(query) {
        return this.tradingEngineService.getOpenTrades(query);
    }
    getTradeHistory(query) {
        return this.tradingEngineService.getTradeHistory(query);
    }
    settleExpiredTrades(userId) {
        return this.tradingEngineService.settleExpiredTrades(userId);
    }
};
exports.TradingEngineController = TradingEngineController;
__decorate([
    (0, common_1.Get)('wallet'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Post)('open'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "openTrade", null);
__decorate([
    (0, common_1.Get)('open'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getOpenTrades", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "getTradeHistory", null);
__decorate([
    (0, common_1.Post)('settle-expired'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradingEngineController.prototype, "settleExpiredTrades", null);
exports.TradingEngineController = TradingEngineController = __decorate([
    (0, common_1.Controller)('trading'),
    __metadata("design:paramtypes", [trading_engine_service_1.TradingEngineService])
], TradingEngineController);
//# sourceMappingURL=trading-engine.controller.js.map