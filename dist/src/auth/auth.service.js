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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, emailsService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailsService = emailsService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    getFrontendUrl() {
        return (this.configService.get('FRONTEND_URL') ||
            'http://localhost:5173').replace(/\/+$/, '');
    }
    getUserModelFields() {
        const runtimeModel = this.prisma?._runtimeDataModel?.models?.User;
        if (!runtimeModel?.fields) {
            return [];
        }
        return runtimeModel.fields.map((field) => field.name);
    }
    getPasswordFieldName() {
        const fields = this.getUserModelFields();
        if (fields.includes('password'))
            return 'password';
        if (fields.includes('passwordHash'))
            return 'passwordHash';
        if (fields.includes('hashedPassword'))
            return 'hashedPassword';
        return 'password';
    }
    getNameFieldName() {
        const fields = this.getUserModelFields();
        if (fields.includes('fullName'))
            return 'fullName';
        if (fields.includes('name'))
            return 'name';
        return null;
    }
    getUserDisplayName(user) {
        return (user?.fullName ||
            user?.name ||
            user?.email?.split('@')?.[0] ||
            'Trader');
    }
    removeSensitiveFields(user) {
        if (!user)
            return null;
        const { password, passwordHash, hashedPassword, ...safeUser } = user;
        return safeUser;
    }
    signToken(user) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
    }
    async sendEmailSafely(label, send) {
        try {
            await send();
        }
        catch (error) {
            this.logger.error(`${label} failed`, error);
        }
    }
    async register(payload) {
        const email = this.normalizeEmail(payload.email || '');
        const fullName = (payload.fullName || payload.name || '').trim();
        if (!email || !payload.password) {
            throw new common_1.BadRequestException('Email and password are required.');
        }
        if (payload.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('An account with this email already exists.');
        }
        const hashedPassword = await bcrypt.hash(payload.password, 12);
        const passwordField = this.getPasswordFieldName();
        const nameField = this.getNameFieldName();
        const userData = {
            email,
            [passwordField]: hashedPassword,
        };
        if (nameField) {
            userData[nameField] = fullName;
        }
        const user = await this.prisma.user.create({
            data: userData,
        });
        await this.sendEmailSafely('sendAccountCreatedEmail', () => this.emailsService.sendAccountCreatedEmail(user.email, this.getUserDisplayName(user)));
        const token = this.signToken(user);
        return {
            success: true,
            message: 'Account created successfully.',
            token,
            accessToken: token,
            user: this.removeSensitiveFields(user),
        };
    }
    async login(payload) {
        const email = this.normalizeEmail(payload.email || '');
        if (!email || !payload.password) {
            throw new common_1.BadRequestException('Email and password are required.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const passwordField = this.getPasswordFieldName();
        const savedPassword = user[passwordField];
        if (!savedPassword) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const validPassword = await bcrypt.compare(payload.password, savedPassword);
        if (!validPassword) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const token = this.signToken(user);
        return {
            success: true,
            message: 'Signed in successfully.',
            token,
            accessToken: token,
            user: this.removeSensitiveFields(user),
        };
    }
    async forgotPassword(payload) {
        const email = this.normalizeEmail(payload.email || '');
        if (!email) {
            throw new common_1.BadRequestException('Email is required.');
        }
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                success: true,
                message: 'If this email exists, a password reset message has been sent.',
            };
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
        await this.prisma.passwordResetToken.deleteMany({
            where: {
                userId: user.id,
            },
        });
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        const resetUrl = `${this.getFrontendUrl()}/reset-password?token=${token}`;
        await this.sendEmailSafely('sendPasswordResetEmail', () => this.emailsService.sendPasswordResetEmail(user.email, resetUrl, this.getUserDisplayName(user)));
        return {
            success: true,
            message: 'If this email exists, a password reset message has been sent.',
        };
    }
    async resetPassword(payload) {
        if (!payload.token || !payload.password) {
            throw new common_1.BadRequestException('Token and new password are required.');
        }
        if (payload.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        const resetRecord = await this.prisma.passwordResetToken.findFirst({
            where: {
                token: payload.token,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });
        if (!resetRecord) {
            throw new common_1.BadRequestException('Invalid or expired reset token.');
        }
        const hashedPassword = await bcrypt.hash(payload.password, 12);
        const passwordField = this.getPasswordFieldName();
        await this.prisma.user.update({
            where: {
                id: resetRecord.userId,
            },
            data: {
                [passwordField]: hashedPassword,
            },
        });
        await this.prisma.passwordResetToken.delete({
            where: {
                id: resetRecord.id,
            },
        });
        await this.sendEmailSafely('sendPasswordChangedEmail', () => this.emailsService.sendPasswordChangedEmail(resetRecord.user.email, this.getUserDisplayName(resetRecord.user)));
        return {
            success: true,
            message: 'Password reset successfully.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        emails_service_1.EmailsService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map