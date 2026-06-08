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
exports.DepositsController = void 0;
const common_1 = require("@nestjs/common");
const create_deposit_dto_1 = require("./dto/create-deposit.dto");
const update_deposit_status_dto_1 = require("./dto/update-deposit-status.dto");
const deposits_service_1 = require("./deposits.service");
let DepositsController = class DepositsController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll() {
        return this.service.findAll();
    }
    findByUser(userId) {
        return this.service.findByUser(userId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateStatus(id, dto) {
        return this.service.updateStatus(id, dto);
    }
    markCompleted(id, externalRef) {
        return this.service.markCompleted(id, externalRef);
    }
    markFailed(id, externalRef) {
        return this.service.markFailed(id, externalRef);
    }
};
exports.DepositsController = DepositsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_deposit_dto_1.CreateDepositDto]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_deposit_status_dto_1.UpdateDepositStatusDto]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/completed'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('externalRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "markCompleted", null);
__decorate([
    (0, common_1.Patch)(':id/failed'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('externalRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DepositsController.prototype, "markFailed", null);
exports.DepositsController = DepositsController = __decorate([
    (0, common_1.Controller)('deposits'),
    __metadata("design:paramtypes", [deposits_service_1.DepositsService])
], DepositsController);
//# sourceMappingURL=deposits.controller.js.map