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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let UsersService = class UsersService {
    constructor(prisma, emails) {
        this.prisma = prisma;
        this.emails = emails;
    }
    getUserModelFields() {
        const runtimeModel = this.prisma?._runtimeDataModel?.models?.User;
        if (!runtimeModel?.fields) {
            return [];
        }
        return runtimeModel.fields.map((field) => field.name);
    }
    hasUserField(fieldName) {
        return this.getUserModelFields().includes(fieldName);
    }
    removePassword(user) {
        if (!user)
            return null;
        const { password, passwordHash, hashedPassword, resetToken, resetPasswordToken, ...safeUser } = user;
        return safeUser;
    }
    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return users.map((user) => this.removePassword(user));
    }
    async findById(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User account not found.');
        }
        return this.removePassword(user);
    }
    async getMe(userId) {
        return this.findById(userId);
    }
    async updateMe(userId, payload) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User account not found.');
        }
        if (payload.email !== undefined && payload.email.trim().toLowerCase() !== existingUser.email) {
            throw new common_1.BadRequestException('To change your email address, please contact Support.');
        }
        const data = {};
        if (this.hasUserField('fullName')) {
            data.fullName =
                payload.fullName ??
                    payload.name ??
                    existingUser.fullName;
        }
        if (this.hasUserField('name')) {
            data.name =
                payload.name ??
                    payload.fullName ??
                    existingUser.name;
        }
        if (this.hasUserField('phone')) {
            data.phone = payload.phone ?? existingUser.phone;
        }
        if (this.hasUserField('country')) {
            data.country = payload.country ?? existingUser.country;
        }
        if (this.hasUserField('currency')) {
            data.currency = payload.currency ?? existingUser.currency;
        }
        if (Object.keys(data).length === 0) {
            return this.removePassword(existingUser);
        }
        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: data,
        });
        return this.removePassword(updatedUser);
    }
    async changePassword(userId, payload) {
        const current = String(payload?.currentPassword || '');
        const next = String(payload?.newPassword || '');
        if (!current || !next)
            throw new common_1.BadRequestException('Enter your current and new password.');
        if (next.length < 8 || next.length > 128)
            throw new common_1.BadRequestException('The new password must be 8 to 128 characters.');
        if (next === current)
            throw new common_1.BadRequestException('The new password must be different from the current one.');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status === 'DELETED')
            throw new common_1.NotFoundException('User account not found.');
        if (!(await bcrypt.compare(current, user.passwordHash)))
            throw new common_1.UnauthorizedException('Current password is incorrect.');
        const changedAt = new Date();
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(next, 12) } });
        const emailSent = this.emails
            ? await this.emails.sendPasswordChangedEmail(user.email, user.fullName, { userId, changedAt }).catch(() => false)
            : false;
        return { success: true, emailSent, message: 'Password changed successfully.' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], UsersService);
//# sourceMappingURL=users.service.js.map