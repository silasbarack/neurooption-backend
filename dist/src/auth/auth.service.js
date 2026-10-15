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
const RESET_REQUEST_COOLDOWN_MS = 60_000;
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60_000;
const VERIFY_RESEND_COOLDOWN_MS = 60_000;
const VERIFY_RESENDS_PER_HOUR = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESET_ATTEMPT_WINDOW_MS = 15 * 60_000;
const MAX_RESET_ATTEMPTS = 5;
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, emailsService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailsService = emailsService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.resetAttempts = new Map();
        this.welcomeResends = new Map();
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
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
    isResetLocked(email) {
        const entry = this.resetAttempts.get(email);
        if (!entry)
            return false;
        if (Date.now() - entry.since > RESET_ATTEMPT_WINDOW_MS) {
            this.resetAttempts.delete(email);
            return false;
        }
        return entry.count >= MAX_RESET_ATTEMPTS;
    }
    async recordFailedResetAttempt(email) {
        const now = Date.now();
        const current = this.resetAttempts.get(email);
        const entry = current && now - current.since <= RESET_ATTEMPT_WINDOW_MS
            ? current
            : { count: 0, since: now };
        entry.count += 1;
        this.resetAttempts.set(email, entry);
        if (this.resetAttempts.size > 5000) {
            for (const [key, value] of this.resetAttempts) {
                if (now - value.since > RESET_ATTEMPT_WINDOW_MS)
                    this.resetAttempts.delete(key);
            }
        }
        if (entry.count >= MAX_RESET_ATTEMPTS) {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (user) {
                await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
            }
        }
    }
    async sendEmailSafely(label, send) {
        try {
            await send();
        }
        catch (error) {
            this.logger.error(`${label} failed`, error);
        }
    }
    maskRecipient(email) {
        const [local, domain] = email.split('@');
        return domain ? `${local.slice(0, 1)}***@${domain}` : '***';
    }
    async resendWelcomeEmail(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status === 'DELETED') {
            throw new common_1.UnauthorizedException('Account unavailable.');
        }
        const last = this.welcomeResends.get(userId);
        if (last && Date.now() - last < 60_000) {
            throw new common_1.BadRequestException('Please wait one minute before resending the welcome email.');
        }
        this.welcomeResends.set(userId, Date.now());
        let emailSent = false;
        try {
            const verifyUrl = user.emailVerifiedAt ? undefined : await this.issueVerificationLink(user.id);
            emailSent = await this.emailsService.sendAccountCreatedEmail(user.email, this.getUserDisplayName(user), { userId: user.id, verifyUrl });
        }
        catch (error) {
            this.logger.error('Resend welcome email failed', error);
        }
        if (!emailSent)
            this.welcomeResends.delete(userId);
        return {
            success: emailSent,
            emailSent,
            emailHint: this.maskRecipient(user.email),
            message: emailSent
                ? 'Your welcome email was accepted for delivery. Check the registered inbox and spam folder.'
                : 'The email provider could not accept your welcome email. Please contact Support.',
        };
    }
    async register(payload) {
        const email = this.normalizeEmail(payload.email || '');
        const fullName = (payload.fullName || payload.name || '').trim();
        if (!email || !payload.password) {
            throw new common_1.BadRequestException('Email and password are required.');
        }
        if (!EMAIL_PATTERN.test(email) || email.length > 254) {
            throw new common_1.BadRequestException('Enter a valid email address.');
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
        let user;
        try {
            user = await this.prisma.user.create({
                data: userData,
            });
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('An account with this email already exists.');
            }
            throw error;
        }
        let welcomeEmailSent = false;
        try {
            const verifyUrl = await this.issueVerificationLink(user.id);
            welcomeEmailSent = await this.emailsService.sendAccountCreatedEmail(user.email, this.getUserDisplayName(user), { userId: user.id, verifyUrl });
        }
        catch (error) {
            this.logger.error('Welcome email send failed', error);
        }
        const token = this.signToken(user);
        return {
            success: true,
            message: 'Account created successfully.',
            welcomeEmailSent,
            welcomeEmailHint: this.maskRecipient(user.email),
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
        if (!user || user.status === 'DELETED') {
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
        if (!user || user.status === 'DELETED') {
            return {
                success: true,
                message: 'If this email exists, a password reset message has been sent.',
            };
        }
        const recent = await this.prisma.passwordResetToken.findFirst({
            where: {
                userId: user.id,
                createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_MS) },
            },
        });
        if (recent) {
            return {
                success: true,
                message: 'If this email exists, a six-digit verification code has been sent.',
            };
        }
        const code = String((0, crypto_1.randomInt)(100000, 1000000));
        const codeHash = (0, crypto_1.createHash)('sha256').update(code).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
        await this.prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: codeHash,
                expiresAt,
            },
        });
        let sent = false;
        try {
            sent = await this.emailsService.sendPasswordRecoveryCodeEmail(user.email, code, this.getUserDisplayName(user));
        }
        catch (error) {
            this.logger.error('Password recovery email failed', error);
        }
        if (!sent) {
            await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id, token: codeHash } });
            this.logger.error('Password reset email not accepted by configured provider.');
        }
        return {
            success: true,
            message: 'If this email exists, a six-digit verification code has been sent.',
        };
    }
    async resetPassword(payload) {
        const email = this.normalizeEmail(payload.email || '');
        const code = String(payload.code || '').trim();
        if (!email || !/^\d{6}$/.test(code) || !payload.password) {
            throw new common_1.BadRequestException('Email, six-digit verification code and new password are required.');
        }
        if (payload.password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters.');
        }
        if (this.isResetLocked(email)) {
            throw new common_1.BadRequestException('Too many incorrect codes. Request a new verification code and try again.');
        }
        const codeHash = (0, crypto_1.createHash)('sha256').update(code).digest('hex');
        const resetRecord = await this.prisma.passwordResetToken.findFirst({
            where: {
                token: codeHash,
                used: false,
                expiresAt: { gt: new Date() },
                user: { email },
            },
            include: {
                user: true,
            },
        });
        if (!resetRecord) {
            await this.recordFailedResetAttempt(email);
            throw new common_1.BadRequestException('Invalid or expired verification code.');
        }
        this.resetAttempts.delete(email);
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
        await this.prisma.passwordResetToken.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });
        await this.prisma.passwordResetToken.deleteMany({
            where: { userId: resetRecord.userId, id: { not: resetRecord.id } },
        });
        await this.sendEmailSafely('sendPasswordChangedEmail', () => this.emailsService.sendPasswordChangedEmail(resetRecord.user.email, this.getUserDisplayName(resetRecord.user), { userId: resetRecord.userId, changedAt: new Date() }));
        return {
            success: true,
            message: 'Password reset successfully.',
        };
    }
    async issueVerificationLink(userId) {
        const token = (0, crypto_1.randomBytes)(32).toString('base64url');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        await this.prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } });
        await this.prisma.emailVerificationToken.create({
            data: { userId, tokenHash, expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS) },
        });
        return this.emailsService.appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
    }
    async verifyEmail(payload) {
        const token = String(payload?.token || '').trim();
        if (token.length < 20 || token.length > 200) {
            throw new common_1.BadRequestException('This verification link is not valid.');
        }
        const tokenHash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        const record = await this.prisma.emailVerificationToken.findUnique({
            where: { tokenHash },
            include: { user: { select: { id: true, status: true, emailVerifiedAt: true } } },
        });
        if (!record || record.user.status === 'DELETED') {
            throw new common_1.BadRequestException('This verification link is not valid.');
        }
        if (record.usedAt) {
            if (record.user.emailVerifiedAt)
                return { success: true, alreadyVerified: true, message: 'Your email address is already verified.' };
            throw new common_1.BadRequestException('This verification link has already been used.');
        }
        if (record.expiresAt.getTime() < Date.now()) {
            throw new common_1.BadRequestException('This verification link has expired. Sign in and request a new one.');
        }
        const now = new Date();
        const claimed = await this.prisma.emailVerificationToken.updateMany({ where: { id: record.id, usedAt: null }, data: { usedAt: now } });
        if (claimed.count === 0)
            throw new common_1.BadRequestException('This verification link has already been used.');
        await this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: record.user.emailVerifiedAt ?? now } });
        await this.prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId, usedAt: null } });
        return { success: true, alreadyVerified: false, message: 'Thank you. Your email address is verified.' };
    }
    async resendVerification(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status === 'DELETED')
            throw new common_1.UnauthorizedException('Account unavailable.');
        if (user.emailVerifiedAt) {
            return { success: true, emailSent: false, alreadyVerified: true, message: 'Your email address is already verified.' };
        }
        const now = Date.now();
        const [lastMinute, lastHour] = await Promise.all([
            this.prisma.emailVerificationToken.count({ where: { userId, createdAt: { gt: new Date(now - VERIFY_RESEND_COOLDOWN_MS) } } }),
            this.prisma.emailMessage.count({ where: { userId, kind: 'email_verification', createdAt: { gt: new Date(now - 60 * 60_000) } } }),
        ]);
        if (lastMinute > 0)
            throw new common_1.HttpException('Please wait a minute before requesting another link.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        if (lastHour >= VERIFY_RESENDS_PER_HOUR)
            throw new common_1.HttpException('Too many verification emails this hour. Please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        const verifyUrl = await this.issueVerificationLink(userId);
        const emailSent = await this.emailsService.sendEmailVerificationEmail(user.email, this.getUserDisplayName(user), verifyUrl, { userId });
        return {
            success: emailSent,
            emailSent,
            alreadyVerified: false,
            emailHint: this.maskRecipient(user.email),
            message: emailSent
                ? 'Verification email accepted by our email provider. Check your inbox and spam folder; the link works for 24 hours.'
                : 'We could not send the verification email right now. Please try again shortly.',
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