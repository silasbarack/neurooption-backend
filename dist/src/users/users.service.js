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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, emailsService) {
        this.prisma = prisma;
        this.emailsService = emailsService;
        this.logger = new common_1.Logger(UsersService_1.name);
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
    getUserDisplayName(user) {
        return (user?.fullName ||
            user?.name ||
            user?.email?.split('@')?.[0] ||
            'Trader');
    }
    async sendAccountDeletedEmailSafely(user) {
        try {
            const emailService = this.emailsService;
            if (typeof emailService.sendAccountDeletedEmail !== 'function') {
                this.logger.warn('EmailsService.sendAccountDeletedEmail does not exist. Skipping account deletion email.');
                return;
            }
            await emailService.sendAccountDeletedEmail({
                email: user.email,
                fullName: this.getUserDisplayName(user),
            });
        }
        catch (error) {
            this.logger.error('Account deletion email failed', error);
        }
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
    async deleteMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User account not found.');
        }
        try {
            await this.prisma.user.delete({
                where: {
                    id: userId,
                },
            });
        }
        catch (error) {
            this.logger.error('Account deletion failed', error);
            if (error?.code === 'P2003') {
                throw new common_1.BadRequestException('Account could not be deleted because it still has linked records.');
            }
            throw new common_1.BadRequestException('Account could not be deleted.');
        }
        await this.sendAccountDeletedEmailSafely(user);
        return {
            success: true,
            message: 'Account deleted successfully.',
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], UsersService);
//# sourceMappingURL=users.service.js.map