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
const prisma_service_1 = require("../config/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
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
        });
    }
    async login(dto) {
        const admin = await this.prisma.admin.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(dto.password, admin.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!admin.isActive) {
            throw new common_1.UnauthorizedException('Admin disabled');
        }
        return {
            message: 'Login successful',
            adminId: admin.id,
            role: admin.role,
        };
    }
    async findAll() {
        return this.prisma.admin.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { id },
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
        });
    }
    async disable(id) {
        return this.prisma.admin.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }
    async enable(id) {
        return this.prisma.admin.update({
            where: { id },
            data: {
                isActive: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.admin.delete({
            where: { id },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map