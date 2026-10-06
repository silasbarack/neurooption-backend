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
exports.AccountService = void 0;
exports.accountNumberFor = accountNumberFor;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const wallets_service_1 = require("../wallets/wallets.service");
const REAL_CURRENCY = 'KES';
function accountNumberFor(userId) {
    const digest = (0, node_crypto_1.createHash)('sha256').update(userId).digest();
    return `N${String(digest.readUInt32BE(0) % 10_000_000).padStart(7, '0')}`;
}
let AccountService = class AccountService {
    constructor(prisma, wallets) {
        this.prisma = prisma;
        this.wallets = wallets;
    }
    async summary(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Account not found.');
        const [realWallet, demoWallet] = await Promise.all([
            this.prisma.wallet.findUnique({
                where: { userId_currency: { userId, currency: REAL_CURRENCY } },
            }),
            this.wallets.getBalance(userId, 'QT Demo', 'USD'),
        ]);
        const checklist = [
            { key: 'name', label: 'Full name', done: Boolean(user.fullName?.trim()) },
            { key: 'email', label: 'Email address', done: Boolean(user.email) },
            { key: 'phone', label: 'Phone number', done: Boolean(user.phone) },
            { key: 'kyc', label: 'Identity verification', done: user.kycStatus === 'APPROVED' },
        ];
        const completion = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);
        return {
            id: user.id,
            accountNumber: accountNumberFor(user.id),
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            kycStatus: user.kycStatus,
            verified: user.kycStatus === 'APPROVED',
            memberSince: user.createdAt,
            profile: { completion, checklist },
            real: {
                currency: REAL_CURRENCY,
                balance: realWallet ? Number(realWallet.balance) : 0,
                locked: realWallet ? Number(realWallet.locked) : 0,
            },
            demo: { currency: 'USD', balance: demoWallet.balanceUsd },
        };
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallets_service_1.WalletsService])
], AccountService);
//# sourceMappingURL=account.service.js.map