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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSessionGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../config/prisma.service");
let AdminSessionGuard = class AdminSessionGuard {
    constructor(jwt, prisma) {
        this.jwt = jwt;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('Admin sign-in required.');
        const token = header.slice(7).trim();
        if (!token)
            throw new common_1.UnauthorizedException('Admin sign-in required.');
        let payload;
        try {
            payload = await this.jwt.verifyAsync(token, {
                issuer: 'neurooption-admin',
                audience: 'neurooption-admin-dashboard',
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Admin session expired or invalid.');
        }
        if (!payload.sub || payload.purpose !== 'admin-dashboard') {
            throw new common_1.UnauthorizedException('Admin session invalid.');
        }
        const admin = await this.prisma.admin.findUnique({
            where: { id: payload.sub },
            select: { id: true, fullName: true, email: true, role: true, isActive: true },
        });
        if (!admin || !admin.isActive)
            throw new common_1.UnauthorizedException('Admin access revoked.');
        req.admin = { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role };
        return true;
    }
};
exports.AdminSessionGuard = AdminSessionGuard;
exports.AdminSessionGuard = AdminSessionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], AdminSessionGuard);
//# sourceMappingURL=admin-session.guard.js.map