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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
let ProfileService = class ProfileService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallets: true,
                kycRecords: true,
                transactions: true,
                deposits: true,
                withdrawals: true,
                payouts: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.sanitizeUser(user);
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (dto.phone && dto.phone !== user.phone) {
            const phoneExists = await this.prisma.user.findUnique({
                where: { phone: dto.phone },
            });
            if (phoneExists) {
                throw new common_1.ConflictException('Phone already exists');
            }
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone,
            },
            include: {
                wallets: true,
                kycRecords: true,
            },
        });
        return this.sanitizeUser(updated);
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const validPassword = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!validPassword) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
            },
        });
        return {
            message: 'Password changed successfully',
        };
    }
    sanitizeUser(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map