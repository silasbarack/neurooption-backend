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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, emailsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailsService = emailsService;
    }
    async register(dto) {
        const fullName = dto.fullName?.trim();
        const email = dto.email?.trim().toLowerCase();
        const phone = dto.phone?.trim() || null;
        if (!fullName) {
            throw new common_1.BadRequestException('Full name is required.');
        }
        if (!email) {
            throw new common_1.BadRequestException('Email is required.');
        }
        if (!dto.password) {
            throw new common_1.BadRequestException('Password is required.');
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists.');
        }
        if (phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Phone already exists.');
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                fullName,
                email,
                phone,
                passwordHash,
                wallets: {
                    create: [
                        { currency: 'KES', balance: 0, locked: 0 },
                        { currency: 'USD', balance: 0, locked: 0 },
                    ],
                },
                tradingAccounts: {
                    create: [
                        {
                            type: 'DEMO',
                            currency: 'USD',
                            balance: 70000,
                            locked: 0,
                            isActive: true,
                        },
                        {
                            type: 'REAL',
                            currency: 'KES',
                            balance: 0,
                            locked: 0,
                            isActive: true,
                        },
                    ],
                },
            },
            include: {
                wallets: true,
                tradingAccounts: true,
            },
        });
        await this.emailsService.sendAccountCreatedEmail(user.email, user.fullName);
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const email = dto.email?.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const passwordIsValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordIsValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        return this.buildAuthResponse(user);
    }
    async forgotPassword(dto) {
        const email = dto.email?.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If the email exists, a reset link has been sent.',
            };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        const passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: {
                token: passwordResetTokenHash,
                expiresAt: passwordResetExpiresAt,
                user: {
                    connect: { id: user.id },
                },
            },
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        const sent = await this.emailsService.sendPasswordResetEmail(user.email, resetLink);
        if (!sent) {
            throw new common_1.BadRequestException('Reset link was created, but email could not be sent. Check SMTP settings.');
        }
        return {
            message: 'If the email exists, a reset link has been sent.',
        };
    }
    async resetPassword(dto) {
        if (!dto.token) {
            throw new common_1.BadRequestException('Reset token is required.');
        }
        if (!dto.password || dto.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(dto.token)
            .digest('hex');
        const tokenRecord = await this.prisma.passwordResetToken.findFirst({
            where: {
                token: passwordResetToken,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });
        if (!tokenRecord || !tokenRecord.user) {
            throw new common_1.BadRequestException('Invalid or expired reset link.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.update({
            where: { id: tokenRecord.user.id },
            data: { passwordHash },
        });
        await this.prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
        return {
            message: 'Password reset successful.',
        };
    }
    buildAuthResponse(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        emails_service_1.EmailsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map