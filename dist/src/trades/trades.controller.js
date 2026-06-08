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
exports.TradesController = void 0;
const common_1 = require("@nestjs/common");
const create_trade_dto_1 = require("./dto/create-trade.dto");
const settle_trade_dto_1 = require("./dto/settle-trade.dto");
const trade_query_dto_1 = require("./dto/trade-query.dto");
const trades_service_1 = require("./trades.service");
let TradesController = class TradesController {
    constructor(tradesService) {
        this.tradesService = tradesService;
    }
    create(dto) {
        return this.tradesService.create(dto);
    }
    findAll(query) {
        return this.tradesService.findAll(query);
    }
    findByUser(userId) {
        return this.tradesService.findByUser(userId);
    }
    findOne(id) {
        return this.tradesService.findOne(id);
    }
    settle(id, dto) {
        return this.tradesService.settle(id, dto);
    }
    cancel(id, reason) {
        return this.tradesService.cancel(id, reason);
    }
};
exports.TradesController = TradesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_trade_dto_1.CreateTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trade_query_dto_1.TradeQueryDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/settle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, settle_trade_dto_1.SettleTradeDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "settle", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "cancel", null);
exports.TradesController = TradesController = __decorate([
    (0, common_1.Controller)('trades'),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradesController);
//# sourceMappingURL=trades.controller.js.map