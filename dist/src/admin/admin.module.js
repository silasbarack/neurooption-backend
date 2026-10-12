"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const emails_module_1 = require("../emails/emails.module");
const jwt_config_1 = require("../config/jwt.config");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const admin_session_guard_1 = require("./admin-session.guard");
const admin_super_guard_1 = require("./admin-super.guard");
const trading_monitor_service_1 = require("./trading-monitor.service");
const admin_console_service_1 = require("./admin-console.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({ secret: (0, jwt_config_1.getJwtSecret)() }), emails_module_1.EmailsModule],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard, trading_monitor_service_1.TradingMonitorService, admin_console_service_1.AdminConsoleService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map