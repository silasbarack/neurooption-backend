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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_super_guard_1 = require("./admin-super.guard");
const admin_service_1 = require("./admin.service");
const admin_session_guard_1 = require("./admin-session.guard");
const trading_monitor_service_1 = require("./trading-monitor.service");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const update_admin_dto_1 = require("./dto/update-admin.dto");
const admin_login_dto_1 = require("./dto/admin-login.dto");
let AdminController = class AdminController {
    constructor(adminService, monitor) {
        this.adminService = adminService;
        this.monitor = monitor;
    }
    login(dto) { return this.adminService.login(dto); }
    bootstrapStatus() { return this.adminService.bootstrapStatus(); }
    bootstrapFirstAdmin(body) {
        return this.adminService.bootstrapFirstAdmin(body);
    }
    bootstrapResetPassword(body) {
        return this.adminService.bootstrapResetPassword(body);
    }
    session(req) { return { admin: req.admin }; }
    tradingMonitor(req, query) {
        if (!['SUPER_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN', 'FINANCE_ADMIN'].includes(req.admin.role)) {
            throw new common_1.ForbiddenException('Trading monitoring permission required.');
        }
        return this.monitor.overview(query);
    }
    create(dto) { return this.adminService.create(dto); }
    findAll() { return this.adminService.findAll(); }
    findOne(id) { return this.adminService.findOne(id); }
    update(id, dto) { return this.adminService.update(id, dto); }
    disable(id) { return this.adminService.disable(id); }
    enable(id) { return this.adminService.enable(id); }
    delete(id) { return this.adminService.delete(id); }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('bootstrap-status'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bootstrapStatus", null);
__decorate([
    (0, common_1.Post)('bootstrap'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bootstrapFirstAdmin", null);
__decorate([
    (0, common_1.Post)('bootstrap/reset-password'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "bootstrapResetPassword", null);
__decorate([
    (0, common_1.Get)('session'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "session", null);
__decorate([
    (0, common_1.Get)('trading-monitor'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "tradingMonitor", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/disable'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "disable", null);
__decorate([
    (0, common_1.Patch)(':id/enable'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "enable", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "delete", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService, trading_monitor_service_1.TradingMonitorService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map