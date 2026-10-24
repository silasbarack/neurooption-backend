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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let ProfileService = class ProfileService {
    constructor(prisma, emails) {
        this.prisma = prisma;
        this.emails = emails;
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
        if (dto.email && dto.email.trim().toLowerCase() !== user.email) {
            throw new common_1.BadRequestException('To change your email address, please contact Support.');
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
        const changedAt = new Date();
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
            },
        });
        const emailSent = this.emails
            ? await this.emails.sendPasswordChangedEmail(user.email, user.fullName, { userId, changedAt }).catch(() => false)
            : false;
        return {
            message: 'Password changed successfully',
            emailSent,
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
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map