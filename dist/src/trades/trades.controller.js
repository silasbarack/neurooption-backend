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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
const trade_query_dto_1 = require("./dto/trade-query.dto");
const trades_service_1 = require("./trades.service");
let TradesController = class TradesController {
    constructor(tradesService) {
        this.tradesService = tradesService;
    }
    findAll(query) {
        return this.tradesService.findAll(query);
    }
    findByUser(req, userId) {
        if (req.user.id !== userId && req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('You can only view your own trades.');
        }
        return this.tradesService.findByUser(userId);
    }
    async findOne(req, id) {
        const trade = await this.tradesService.findOne(id);
        if (!trade || (trade.userId !== req.user.id && req.user.role !== 'ADMIN')) {
            throw new common_1.NotFoundException('Trade not found.');
        }
        return trade;
    }
};
exports.TradesController = TradesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trade_query_dto_1.TradeQueryDto]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TradesController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TradesController.prototype, "findOne", null);
exports.TradesController = TradesController = __decorate([
    (0, common_1.Controller)('trades'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [trades_service_1.TradesService])
], TradesController);
//# sourceMappingURL=trades.controller.js.map