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
exports.AffiliatesController = void 0;
const common_1 = require("@nestjs/common");
const affiliates_service_1 = require("./affiliates.service");
const create_affiliate_commission_dto_1 = require("./dto/create-affiliate-commission.dto");
const create_affiliate_dto_1 = require("./dto/create-affiliate.dto");
const update_affiliate_dto_1 = require("./dto/update-affiliate.dto");
const update_commission_status_dto_1 = require("./dto/update-commission-status.dto");
let AffiliatesController = class AffiliatesController {
    constructor(affiliatesService) {
        this.affiliatesService = affiliatesService;
    }
    createAffiliate(dto) {
        return this.affiliatesService.createAffiliate(dto);
    }
    findAllAffiliates() {
        return this.affiliatesService.findAllAffiliates();
    }
    findAffiliateById(id) {
        return this.affiliatesService.findAffiliateById(id);
    }
    findAffiliateByUser(userId) {
        return this.affiliatesService.findAffiliateByUser(userId);
    }
    updateAffiliate(id, dto) {
        return this.affiliatesService.updateAffiliate(id, dto);
    }
    createCommission(dto) {
        return this.affiliatesService.createCommission(dto);
    }
    findAllCommissions() {
        return this.affiliatesService.findAllCommissions();
    }
    findCommissionsByAffiliate(affiliateId) {
        return this.affiliatesService.findCommissionsByAffiliate(affiliateId);
    }
    updateCommissionStatus(id, dto) {
        return this.affiliatesService.updateCommissionStatus(id, dto);
    }
    payCommission(id, walletId) {
        return this.affiliatesService.payCommission(id, walletId);
    }
};
exports.AffiliatesController = AffiliatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_affiliate_dto_1.CreateAffiliateDto]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "createAffiliate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "findAllAffiliates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "findAffiliateById", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "findAffiliateByUser", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_affiliate_dto_1.UpdateAffiliateDto]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "updateAffiliate", null);
__decorate([
    (0, common_1.Post)('commissions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_affiliate_commission_dto_1.CreateAffiliateCommissionDto]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "createCommission", null);
__decorate([
    (0, common_1.Get)('commissions/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "findAllCommissions", null);
__decorate([
    (0, common_1.Get)(':affiliateId/commissions'),
    __param(0, (0, common_1.Param)('affiliateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "findCommissionsByAffiliate", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_commission_status_dto_1.UpdateCommissionStatusDto]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "updateCommissionStatus", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/pay/:walletId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AffiliatesController.prototype, "payCommission", null);
exports.AffiliatesController = AffiliatesController = __decorate([
    (0, common_1.Controller)('affiliates'),
    __metadata("design:paramtypes", [affiliates_service_1.AffiliatesService])
], AffiliatesController);
//# sourceMappingURL=affiliates.controller.js.map