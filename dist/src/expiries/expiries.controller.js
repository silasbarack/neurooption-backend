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
exports.ExpiriesController = void 0;
const common_1 = require("@nestjs/common");
const expiries_service_1 = require("./expiries.service");
const create_expiry_dto_1 = require("./dto/create-expiry.dto");
const update_expiry_dto_1 = require("./dto/update-expiry.dto");
let ExpiriesController = class ExpiriesController {
    constructor(expiriesService) {
        this.expiriesService = expiriesService;
    }
    create(dto) {
        return this.expiriesService.create(dto);
    }
    findAll() {
        return this.expiriesService.findAll();
    }
    findActive() {
        return this.expiriesService.findActive();
    }
    findOne(duration) {
        return this.expiriesService.findOne(duration);
    }
    update(duration, dto) {
        return this.expiriesService.update(duration, dto);
    }
    remove(duration) {
        return this.expiriesService.remove(duration);
    }
};
exports.ExpiriesController = ExpiriesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expiry_dto_1.CreateExpiryDto]),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':duration'),
    __param(0, (0, common_1.Param)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':duration'),
    __param(0, (0, common_1.Param)('duration')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expiry_dto_1.UpdateExpiryDto]),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':duration'),
    __param(0, (0, common_1.Param)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpiriesController.prototype, "remove", null);
exports.ExpiriesController = ExpiriesController = __decorate([
    (0, common_1.Controller)('expiries'),
    __metadata("design:paramtypes", [expiries_service_1.ExpiriesService])
], ExpiriesController);
//# sourceMappingURL=expiries.controller.js.map