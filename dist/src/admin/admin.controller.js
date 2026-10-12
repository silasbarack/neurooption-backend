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
const admin_console_service_1 = require("./admin-console.service");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const update_admin_dto_1 = require("./dto/update-admin.dto");
const admin_login_dto_1 = require("./dto/admin-login.dto");
let AdminController = class AdminController {
    constructor(adminService, monitor, console) {
        this.adminService = adminService;
        this.monitor = monitor;
        this.console = console;
    }
    login(dto) { return this.adminService.login(dto); }
    bootstrapStatus() { return this.adminService.bootstrapStatus(); }
    bootstrapFirstAdmin(body) {
        return this.adminService.bootstrapFirstAdmin(body);
    }
    bootstrapResetPassword(body) {
        return this.adminService.bootstrapResetPassword(body);
    }
    session(req) {
        return { admin: req.admin, permissions: this.console.permissionsFor(req.admin.role) };
    }
    tradingMonitor(req, query) {
        this.console.assertCan(req.admin, 'trading');
        return this.monitor.overview(query);
    }
    overview(req) {
        this.console.assertCan(req.admin, 'overview');
        return this.console.overview();
    }
    users(req, query) {
        this.console.assertCan(req.admin, 'users');
        return this.console.listUsers(query);
    }
    user(req, id) {
        this.console.assertCan(req.admin, 'users');
        return this.console.userDetail(id);
    }
    userStatus(req, id, body) {
        this.console.assertCan(req.admin, 'userStatus');
        return this.console.setUserStatus(req.admin, id, body);
    }
    kyc(req, query) {
        this.console.assertCan(req.admin, 'kyc');
        return this.console.listKyc(query);
    }
    reviewKyc(req, id, body) {
        this.console.assertCan(req.admin, 'kyc');
        return this.console.reviewKyc(req.admin, id, body);
    }
    finance(req, query) {
        this.console.assertCan(req.admin, 'finance');
        return this.console.listFinance(query);
    }
    tickets(req, query) {
        this.console.assertCan(req.admin, 'support');
        return this.console.listTickets(query);
    }
    ticket(req, id) {
        this.console.assertCan(req.admin, 'support');
        return this.console.ticketDetail(id);
    }
    ticketStatus(req, id, body) {
        this.console.assertCan(req.admin, 'support');
        return this.console.setTicketStatus(req.admin, id, body);
    }
    replyTicket(req, id, body) {
        this.console.assertCan(req.admin, 'support');
        return this.console.replyToTicket(req.admin, id, body);
    }
    auditLog(req, query) {
        this.console.assertCan(req.admin, 'audit');
        return this.console.listAudit(query);
    }
    async create(req, dto) {
        const admin = await this.adminService.create(dto);
        await this.console.logTeamChange(req.admin, 'ADMIN_CREATED', admin.id, `${admin.email} added as ${admin.role}`);
        return admin;
    }
    findAll() { return this.adminService.findAll(); }
    findOne(id) { return this.adminService.findOne(id); }
    async update(req, id, dto) {
        const admin = await this.adminService.update(req.admin.id, id, dto);
        await this.console.logTeamChange(req.admin, 'ADMIN_UPDATED', id, `${admin.email} updated (${admin.role}, ${admin.isActive ? 'active' : 'disabled'})`);
        return admin;
    }
    async disable(req, id) {
        const admin = await this.adminService.disable(req.admin.id, id);
        await this.console.logTeamChange(req.admin, 'ADMIN_DISABLED', id, `${admin.email} disabled`);
        return admin;
    }
    async enable(req, id) {
        const admin = await this.adminService.enable(id);
        await this.console.logTeamChange(req.admin, 'ADMIN_ENABLED', id, `${admin.email} enabled`);
        return admin;
    }
    async delete(req, id) {
        const admin = await this.adminService.delete(req.admin.id, id);
        await this.console.logTeamChange(req.admin, 'ADMIN_REMOVED', id, `${admin.email} removed`);
        return admin;
    }
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
    (0, common_1.Get)('console/overview'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('console/users'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "users", null);
__decorate([
    (0, common_1.Get)('console/users/:id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "user", null);
__decorate([
    (0, common_1.Patch)('console/users/:id/status'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "userStatus", null);
__decorate([
    (0, common_1.Get)('console/kyc'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "kyc", null);
__decorate([
    (0, common_1.Patch)('console/kyc/:id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reviewKyc", null);
__decorate([
    (0, common_1.Get)('console/finance'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "finance", null);
__decorate([
    (0, common_1.Get)('console/support'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "tickets", null);
__decorate([
    (0, common_1.Get)('console/support/:id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "ticket", null);
__decorate([
    (0, common_1.Patch)('console/support/:id/status'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "ticketStatus", null);
__decorate([
    (0, common_1.Post)('console/support/:id/reply'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "replyTicket", null);
__decorate([
    (0, common_1.Get)('console/audit'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "auditLog", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_admin_dto_1.CreateAdminDto]),
    __metadata("design:returntype", Promise)
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
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_admin_dto_1.UpdateAdminDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/disable'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "disable", null);
__decorate([
    (0, common_1.Patch)(':id/enable'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "enable", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "delete", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        trading_monitor_service_1.TradingMonitorService,
        admin_console_service_1.AdminConsoleService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map