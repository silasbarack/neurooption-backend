"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_config_1 = require("../config/jwt.config");
const admin_session_guard_1 = require("./admin-session.guard");
const admin_super_guard_1 = require("./admin-super.guard");
let AdminAuthModule = class AdminAuthModule {
};
exports.AdminAuthModule = AdminAuthModule;
exports.AdminAuthModule = AdminAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({ secret: (0, jwt_config_1.getJwtSecret)() })],
        providers: [admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard],
        exports: [jwt_1.JwtModule, admin_session_guard_1.AdminSessionGuard, admin_super_guard_1.AdminSuperGuard],
    })
], AdminAuthModule);
//# sourceMappingURL=admin-auth.module.js.map