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
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma, emailsService) {
        this.prisma = prisma;
        this.emailsService = emailsService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(dto) {
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingEmail)
            throw new common_1.ConflictException('Email already exists');
        if (dto.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: dto.phone },
            });
            if (existingPhone)
                throw new common_1.ConflictException('Phone already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone || null,
                passwordHash,
                status: client_1.AccountStatus.PENDING_KYC,
                kycStatus: client_1.KycStatus.NOT_SUBMITTED,
                wallets: {
                    create: [
                        { currency: 'KES', balance: 0, locked: 0 },
                        { currency: 'USD', balance: 0, locked: 0 },
                    ],
                },
                tradingAccounts: {
                    create: [
                        {
                            type: client_1.AccountType.DEMO,
                            currency: client_1.AccountCurrency.USD,
                            balance: 70000,
                            locked: 0,
                        },
                        {
                            type: client_1.AccountType.REAL,
                            currency: client_1.AccountCurrency.KES,
                            balance: 0,
                            locked: 0,
                        },
                    ],
                },
            },
            include: this.includeRelations(),
        });
        const createdUser = this.sanitizeUser(user);
        const sent = await this.emailsService.sendAccountCreatedEmail(createdUser.email, createdUser.fullName);
        if (!sent) {
            this.logger.warn(`Account created but welcome email could not be sent to ${createdUser.email}`);
        }
        return createdUser;
    }
    async findAll(opts) {
        if (!opts) {
            const users = await this.prisma.user.findMany({
                include: this.includeRelations(),
                orderBy: { createdAt: 'desc' },
            });
            return users.map((u) => this.sanitizeUser(u));
        }
        const { page = 1, limit, take = 20, q, search, status } = opts;
        const resolvedTake = typeof limit === 'number' ? limit : take;
        const resolvedSearch = q ?? search;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        if (status)
            where.status = status;
        const users = await this.prisma.user.findMany({
            where,
            include: this.includeRelations(),
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * resolvedTake,
            take: resolvedTake,
        });
        return users.map((u) => this.sanitizeUser(u));
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.sanitizeUser(user);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: this.includeRelations(),
        });
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingEmail && existingEmail.id !== id)
                throw new common_1.ConflictException('Email already exists');
        }
        if (dto.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: dto.phone },
            });
            if (existingPhone && existingPhone.id !== id)
                throw new common_1.ConflictException('Phone already exists');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                fullName: dto.fullName ?? undefined,
                email: dto.email ?? undefined,
                phone: dto.phone ?? undefined,
            },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status: dto.status },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async updateKycStatus(id, dto) {
        await this.findOne(id);
        const status = dto.kycStatus === client_1.KycStatus.APPROVED
            ? client_1.AccountStatus.ACTIVE
            : client_1.AccountStatus.PENDING_KYC;
        const updated = await this.prisma.user.update({
            where: { id },
            data: { kycStatus: dto.kycStatus, status },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async suspend(id) {
        await this.findOne(id);
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status: client_1.AccountStatus.SUSPENDED },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async lock(id) {
        await this.findOne(id);
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status: client_1.AccountStatus.LOCKED },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async activate(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.kycStatus !== client_1.KycStatus.APPROVED)
            throw new common_1.BadRequestException('User KYC must be approved first');
        const updated = await this.prisma.user.update({
            where: { id },
            data: { status: client_1.AccountStatus.ACTIVE },
            include: this.includeRelations(),
        });
        return this.sanitizeUser(updated);
    }
    async remove(id) {
        const user = await this.findOne(id);
        const deleted = await this.prisma.user.delete({ where: { id } });
        const sent = await this.emailsService.sendAccountDeletedEmail(user.email, user.fullName);
        if (!sent) {
            this.logger.warn(`Account deleted but notification email could not be sent to ${user.email}`);
        }
        return this.sanitizeUser(deleted);
    }
    includeRelations() {
        return {
            wallets: true,
            tradingAccounts: true,
            trades: true,
            transactions: true,
            kycRecords: true,
            deposits: true,
            withdrawals: true,
            payouts: true,
            supportTickets: true,
            notifications: true,
        };
    }
    sanitizeUser(user) {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], UsersService);
//# sourceMappingURL=users.service.js.map