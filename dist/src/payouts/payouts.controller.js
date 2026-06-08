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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const calculate_payout_dto_1 = require("./dto/calculate-payout.dto");
const create_payout_dto_1 = require("./dto/create-payout.dto");
const update_asset_payout_dto_1 = require("./dto/update-asset-payout.dto");
const payouts_service_1 = require("./payouts.service");
let PayoutsController = class PayoutsController {
    constructor(payoutsService) {
        this.payoutsService = payoutsService;
    }
    calculateExpectedPayout(dto) {
        return this.payoutsService.calculateExpectedPayout(dto);
    }
    updateAssetPayout(dto) {
        return this.payoutsService.updateAssetPayout(dto);
    }
    create(dto) {
        return this.payoutsService.create(dto);
    }
    findAll() {
        return this.payoutsService.findAll();
    }
    findByUser(userId) {
        return this.payoutsService.findByUser(userId);
    }
    findByTrade(tradeId) {
        return this.payoutsService.findByTrade(tradeId);
    }
    findOne(id) {
        return this.payoutsService.findOne(id);
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_payout_dto_1.CalculatePayoutDto]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "calculateExpectedPayout", null);
__decorate([
    (0, common_1.Patch)('asset-rate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_asset_payout_dto_1.UpdateAssetPayoutDto]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "updateAssetPayout", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payout_dto_1.CreatePayoutDto]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('trade/:tradeId'),
    __param(0, (0, common_1.Param)('tradeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "findByTrade", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayoutsController.prototype, "findOne", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payouts'),
    __metadata("design:paramtypes", [payouts_service_1.PayoutsService])
], PayoutsController);
//# sourceMappingURL=payouts.controller.js.map