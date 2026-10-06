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
var MpesaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const stk_push_dto_1 = require("./dto/stk-push.dto");
const mpesa_service_1 = require("./mpesa.service");
let MpesaController = MpesaController_1 = class MpesaController {
    constructor(mpesa) {
        this.mpesa = mpesa;
        this.logger = new common_1.Logger(MpesaController_1.name);
    }
    config() {
        const { configured, environment, minAmount, maxAmount } = this.mpesa.configSummary();
        return { configured, environment, minAmount, maxAmount };
    }
    startDeposit(req, dto) {
        return this.mpesa.startDeposit(req.user.id, dto.phone, dto.amount);
    }
    depositStatus(req, id) {
        return this.mpesa.getDepositStatus(req.user.id, id);
    }
    async callback(token, body) {
        const expected = Buffer.from(this.mpesa.callbackToken);
        const given = Buffer.from(String(token || ''));
        if (expected.length !== given.length || !(0, crypto_1.timingSafeEqual)(expected, given)) {
            throw new common_1.ForbiddenException();
        }
        try {
            await this.mpesa.handleCallback(body);
        }
        catch (error) {
            this.logger.error(`STK callback handling failed: ${error instanceof Error ? error.message : error}`);
        }
        return { ResultCode: 0, ResultDesc: 'Accepted' };
    }
};
exports.MpesaController = MpesaController;
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "config", null);
__decorate([
    (0, common_1.Post)('deposits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, stk_push_dto_1.StkPushDto]),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "startDeposit", null);
__decorate([
    (0, common_1.Get)('deposits/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MpesaController.prototype, "depositStatus", null);
__decorate([
    (0, common_1.Post)('callback/:token'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "callback", null);
exports.MpesaController = MpesaController = MpesaController_1 = __decorate([
    (0, common_1.Controller)('payments/stk'),
    __metadata("design:paramtypes", [mpesa_service_1.MpesaService])
], MpesaController);
//# sourceMappingURL=mpesa.controller.js.map