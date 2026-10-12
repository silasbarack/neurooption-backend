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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const node_crypto_1 = require("node:crypto");
const jwt_1 = require("@nestjs/jwt");
const ADMIN_SELECT = { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true };
const prisma_service_1 = require("../config/prisma.service");
let AdminService = class AdminService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.loginFailures = new Map();
    }
    async create(dto) {
        const existing = await this.prisma.admin.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Admin email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        return this.prisma.admin.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone,
                role: dto.role,
                passwordHash,
            },
            select: ADMIN_SELECT,
        });
    }
    async login(dto) {
        const email = dto.email.trim().toLowerCase();
        const now = Date.now();
        const failures = this.loginFailures.get(email);
        if (failures && now - failures.since < 15 * 60_000 && failures.count >= 5) {
            throw new common_1.HttpException('Too many sign-in attempts. Please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const admin = await this.prisma.admin.findUnique({
            where: {
                email,
            },
        });
        const valid = admin ? await bcrypt.compare(dto.password, admin.passwordHash) : false;
        if (!valid || !admin?.isActive) {
            const previous = failures && now - failures.since < 15 * 60_000 ? failures.count : 0;
            this.loginFailures.set(email, { count: previous + 1, since: failures?.since && now - failures.since < 15 * 60_000 ? failures.since : now });
            throw new common_1.UnauthorizedException('Invalid admin credentials.');
        }
        this.loginFailures.delete(email);
        const token = await this.jwt.signAsync({ sub: admin.id, purpose: 'admin-dashboard' }, { expiresIn: '8h', issuer: 'neurooption-admin', audience: 'neurooption-admin-dashboard' });
        return {
            message: 'Login successful',
            token,
            adminId: admin.id,
            role: admin.role,
            admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role },
        };
    }
    ownerAuthorization() {
        const code = process.env.ADMIN_BOOTSTRAP_KEY?.trim() || '';
        const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || '';
        const expiresAt = Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || '');
        if (code.length < 40 || !email || !Number.isFinite(expiresAt) || Date.now() > expiresAt)
            return null;
        return { code, email };
    }
    requireOwner(setupKey, email) {
        const owner = this.ownerAuthorization();
        if (!owner)
            throw new common_1.UnauthorizedException('Administrator setup is unavailable or expired.');
        const key = String(setupKey || '');
        if (key.length !== owner.code.length || !(0, node_crypto_1.timingSafeEqual)(Buffer.from(key), Buffer.from(owner.code))) {
            throw new common_1.UnauthorizedException('Invalid administrator setup authorization.');
        }
        const normalized = String(email || '').trim().toLowerCase();
        if (normalized !== owner.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
            throw new common_1.UnauthorizedException('Administrator email is not authorized.');
        }
        return normalized;
    }
    assertStrongPassword(password) {
        if (password.length < 14 || password.length > 128 ||
            !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
            throw new common_1.BadRequestException('Password must be 14–128 characters with uppercase, lowercase, a number and a symbol.');
        }
    }
    async bootstrapStatus() {
        if (!this.ownerAuthorization())
            return { available: false };
        const adminCount = await this.prisma.admin.count();
        return { available: true, mode: adminCount === 0 ? 'create' : 'reset' };
    }
    async bootstrapFirstAdmin(body) {
        const email = this.requireOwner(body?.setupKey, body?.email);
        const fullName = String(body?.fullName || '').trim();
        const password = String(body?.password || '');
        if (fullName.length < 3 || fullName.length > 100) {
            throw new common_1.BadRequestException('Enter a full name between 3 and 100 characters.');
        }
        this.assertStrongPassword(password);
        if (await this.prisma.admin.count() !== 0) {
            throw new common_1.ConflictException('An administrator is already provisioned. Initial setup is closed.');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const admin = await this.prisma.admin.create({
            data: { fullName, email, passwordHash, role: 'SUPER_ADMIN', isActive: true },
            select: ADMIN_SELECT,
        });
        return { success: true, message: 'First Super Administrator created. Sign in with your new credentials.', role: admin.role };
    }
    async bootstrapResetPassword(body) {
        const email = this.requireOwner(body?.setupKey, body?.email);
        const password = String(body?.password || '');
        this.assertStrongPassword(password);
        const admin = await this.prisma.admin.findUnique({ where: { email }, select: { id: true, role: true } });
        if (!admin || admin.role !== 'SUPER_ADMIN') {
            throw new common_1.NotFoundException('No Super Administrator uses this email.');
        }
        await this.prisma.admin.update({
            where: { id: admin.id },
            data: { passwordHash: await bcrypt.hash(password, 12), isActive: true },
        });
        this.loginFailures.delete(email);
        return { success: true, message: 'Super Administrator password reset. Sign in with your new password.' };
    }
    async findAll() {
        return this.prisma.admin.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: ADMIN_SELECT,
        });
    }
    async findOne(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
            select: ADMIN_SELECT,
        });
        if (!admin) {
            throw new common_1.NotFoundException('Admin not found');
        }
        return admin;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.admin.update({
            where: { id },
            data: dto,
            select: ADMIN_SELECT,
        });
    }
    async disable(id) {
        return this.prisma.admin.update({
            where: { id },
            data: {
                isActive: false,
            },
            select: ADMIN_SELECT,
        });
    }
    async enable(id) {
        return this.prisma.admin.update({
            where: { id },
            data: {
                isActive: true,
            },
            select: ADMIN_SELECT,
        });
    }
    async delete(id) {
        return this.prisma.admin.delete({
            where: { id },
            select: ADMIN_SELECT,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AdminService);
//# sourceMappingURL=admin.service.js.map