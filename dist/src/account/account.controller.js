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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const account_deletion_service_1 = require("./account-deletion.service");
const account_service_1 = require("./account.service");
const delete_account_dto_1 = require("./dto/delete-account.dto");
let AccountController = class AccountController {
    constructor(account, deletion) {
        this.account = account;
        this.deletion = deletion;
    }
    me(req) {
        return this.account.summary(req.user.id);
    }
    deletionCheck(req) {
        return this.deletion.check(req.user.id);
    }
    deleteAccount(req, dto, userAgent) {
        return this.deletion.deleteAccount(req.user.id, dto, {
            ipAddress: req.ip,
            userAgent,
        });
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('deletion'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "deletionCheck", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, delete_account_dto_1.DeleteAccountDto, String]),
    __metadata("design:returntype", void 0)
], AccountController.prototype, "deleteAccount", null);
exports.AccountController = AccountController = __decorate([
    (0, common_1.Controller)('account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [account_service_1.AccountService,
        account_deletion_service_1.AccountDeletionService])
], AccountController);
//# sourceMappingURL=account.controller.js.map