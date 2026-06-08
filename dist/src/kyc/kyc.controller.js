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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const kyc_service_1 = require("./kyc.service");
const create_kyc_dto_1 = require("./dto/create-kyc.dto");
const review_kyc_dto_1 = require("./dto/review-kyc.dto");
let KycController = class KycController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    submit(dto) {
        return this.kycService.submit(dto);
    }
    findAll() {
        return this.kycService.findAll();
    }
    pending() {
        return this.kycService.pending();
    }
    findOne(id) {
        return this.kycService.findOne(id);
    }
    approve(id, dto) {
        return this.kycService.approve(id, dto);
    }
    reject(id, dto) {
        return this.kycService.reject(id, dto);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_kyc_dto_1.CreateKycDto]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KycController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KycController.prototype, "pending", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_kyc_dto_1.ReviewKycDto]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_kyc_dto_1.ReviewKycDto]),
    __metadata("design:returntype", void 0)
], KycController.prototype, "reject", null);
exports.KycController = KycController = __decorate([
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map