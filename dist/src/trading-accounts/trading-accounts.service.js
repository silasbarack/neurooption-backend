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
exports.TradingAccountsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let TradingAccountsService = class TradingAccountsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.demoStartingBalance = new client_1.Prisma.Decimal(70000);
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const exists = await this.prisma.tradingAccount.findUnique({
            where: {
                userId_type_currency: {
                    userId: dto.userId,
                    type: dto.type,
                    currency: dto.currency,
                },
            },
        });
        if (exists) {
            throw new common_1.ConflictException('Trading account already exists');
        }
        return this.prisma.tradingAccount.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                currency: dto.currency,
                balance: dto.type === client_1.AccountType.DEMO
                    ? this.demoStartingBalance
                    : new client_1.Prisma.Decimal(0),
                locked: 0,
                isActive: true,
            },
            include: this.includeRelations(),
        });
    }
    async createDefaultAccounts(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const existingDemo = await tx.tradingAccount.findUnique({
                where: {
                    userId_type_currency: {
                        userId,
                        type: client_1.AccountType.DEMO,
                        currency: client_1.AccountCurrency.USD,
                    },
                },
            });
            const existingReal = await tx.tradingAccount.findUnique({
                where: {
                    userId_type_currency: {
                        userId,
                        type: client_1.AccountType.REAL,
                        currency: client_1.AccountCurrency.KES,
                    },
                },
            });
            const demo = existingDemo ??
                (await tx.tradingAccount.create({
                    data: {
                        userId,
                        type: client_1.AccountType.DEMO,
                        currency: client_1.AccountCurrency.USD,
                        balance: this.demoStartingBalance,
                        locked: 0,
                        isActive: true,
                    },
                }));
            const real = existingReal ??
                (await tx.tradingAccount.create({
                    data: {
                        userId,
                        type: client_1.AccountType.REAL,
                        currency: client_1.AccountCurrency.KES,
                        balance: 0,
                        locked: 0,
                        isActive: true,
                    },
                }));
            return {
                demo,
                real,
            };
        });
    }
    async findAll() {
        return this.prisma.tradingAccount.findMany({
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.tradingAccount.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUserAndType(userId, type) {
        return this.prisma.tradingAccount.findMany({
            where: {
                userId,
                type,
            },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const account = await this.prisma.tradingAccount.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!account) {
            throw new common_1.NotFoundException('Trading account not found');
        }
        return account;
    }
    async switchCurrency(userId, type, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existing = await this.prisma.tradingAccount.findUnique({
            where: {
                userId_type_currency: {
                    userId,
                    type,
                    currency: dto.currency,
                },
            },
            include: this.includeRelations(),
        });
        if (existing) {
            return existing;
        }
        return this.prisma.tradingAccount.create({
            data: {
                userId,
                type,
                currency: dto.currency,
                balance: type === client_1.AccountType.DEMO
                    ? this.demoStartingBalance
                    : new client_1.Prisma.Decimal(0),
                locked: 0,
                isActive: true,
            },
            include: this.includeRelations(),
        });
    }
    async resetDemoAccount(id) {
        const account = await this.findOne(id);
        if (account.type !== client_1.AccountType.DEMO) {
            throw new common_1.BadRequestException('Only demo accounts can be reset');
        }
        return this.prisma.tradingAccount.update({
            where: { id },
            data: {
                balance: this.demoStartingBalance,
                locked: 0,
            },
            include: this.includeRelations(),
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.tradingAccount.update({
            where: { id },
            data: {
                isActive: dto.isActive,
            },
            include: this.includeRelations(),
        });
    }
    includeRelations() {
        return {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            trades: true,
        };
    }
};
exports.TradingAccountsService = TradingAccountsService;
exports.TradingAccountsService = TradingAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradingAccountsService);
//# sourceMappingURL=trading-accounts.service.js.map