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
var AccountDeletionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountDeletionService = void 0;
exports.maskEmail = maskEmail;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
const account_deletion_constants_1 = require("./account-deletion.constants");
const MAX_PASSWORD_FAILURES = 5;
const PASSWORD_WINDOW_MS = 15 * 60_000;
const kes = (value) => `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!domain)
        return '***';
    return `${local.slice(0, 1)}***@${domain}`;
}
let AccountDeletionService = AccountDeletionService_1 = class AccountDeletionService {
    constructor(prisma, emails) {
        this.prisma = prisma;
        this.emails = emails;
        this.logger = new common_1.Logger(AccountDeletionService_1.name);
        this.passwordFailures = new Map();
    }
    async check(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status === 'DELETED')
            throw new common_1.NotFoundException('Account not found.');
        const blockers = await this.findBlockers(this.prisma, user);
        return {
            canDelete: blockers.length === 0,
            blockers,
            reasons: account_deletion_constants_1.DELETION_REASONS,
            confirmationWord: account_deletion_constants_1.DELETION_CONFIRMATION_WORD,
            emailHint: maskEmail(user.email),
        };
    }
    async deleteAccount(userId, dto, meta = {}) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.status === 'DELETED')
            throw new common_1.NotFoundException('Account not found.');
        if (dto.confirmation?.trim().toUpperCase() !== account_deletion_constants_1.DELETION_CONFIRMATION_WORD) {
            throw new common_1.BadRequestException(`Type ${account_deletion_constants_1.DELETION_CONFIRMATION_WORD} to confirm.`);
        }
        await this.verifyPassword(user.id, dto.password, user.passwordHash);
        const reason = account_deletion_constants_1.DELETION_REASONS.find((item) => item.code === dto.reason);
        const comment = dto.comment?.trim() || undefined;
        const original = {
            email: user.email,
            fullName: user.fullName,
            memberSince: user.createdAt,
        };
        const unusablePassword = await bcrypt.hash((0, node_crypto_1.randomBytes)(32).toString('hex'), 10);
        const deletedAt = new Date();
        const audit = await this.prisma.$transaction(async (tx) => {
            const blockers = await this.findBlockers(tx, user);
            if (blockers.length) {
                throw new common_1.ConflictException({
                    statusCode: 409,
                    code: 'ACCOUNT_DELETION_BLOCKED',
                    message: 'This account cannot be deleted yet.',
                    blockers,
                });
            }
            const closed = await tx.user.updateMany({
                where: { id: user.id, status: { not: 'DELETED' } },
                data: {
                    status: 'DELETED',
                    email: `deleted-${user.id}@deleted.neurooption.invalid`,
                    fullName: 'Deleted user',
                    phone: null,
                    referralCode: null,
                    passwordHash: unusablePassword,
                },
            });
            if (closed.count !== 1)
                throw new common_1.NotFoundException('Account not found.');
            await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
            await tx.socialFollow.updateMany({
                where: { OR: [{ followerUserId: user.id }, { traderUserId: user.id }] },
                data: { status: 'STOPPED' },
            });
            await tx.affiliate.updateMany({ where: { userId: user.id }, data: { status: 'DISABLED' } });
            return tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'ACCOUNT_DELETED',
                    targetType: 'User',
                    targetId: user.id,
                    description: 'Account deleted by its owner.',
                    metadata: {
                        reason: reason?.code ?? null,
                        comment: comment ?? null,
                        deletedAt: deletedAt.toISOString(),
                    },
                    ipAddress: meta.ipAddress,
                    userAgent: meta.userAgent?.slice(0, 300),
                },
            });
        });
        this.passwordFailures.delete(user.id);
        const reference = `DEL-${audit.id.slice(0, 8).toUpperCase()}`;
        let emailSent = false;
        try {
            emailSent = await this.emails.sendAccountDeletionEmail({
                email: original.email,
                fullName: original.fullName,
                reference,
                deletedAt,
                reasonLabel: reason?.label,
            });
        }
        catch (error) {
            this.logger.error(`Deletion email for ${reference} failed: ${error.message}`);
        }
        await this.prisma.auditLog
            .update({
            where: { id: audit.id },
            data: {
                metadata: {
                    reason: reason?.code ?? null,
                    comment: comment ?? null,
                    deletedAt: deletedAt.toISOString(),
                    emailSent,
                },
            },
        })
            .catch(() => undefined);
        return {
            success: true,
            message: 'Your account has been deleted.',
            reference,
            emailSent,
            emailHint: maskEmail(original.email),
        };
    }
    async verifyPassword(userId, password, hash) {
        const now = Date.now();
        const entry = this.passwordFailures.get(userId);
        if (entry && now - entry.since <= PASSWORD_WINDOW_MS && entry.count >= MAX_PASSWORD_FAILURES) {
            throw new common_1.HttpException('Too many incorrect passwords. Try again in a few minutes.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const valid = await bcrypt.compare(password ?? '', hash).catch(() => false);
        if (valid)
            return;
        const fresh = entry && now - entry.since <= PASSWORD_WINDOW_MS ? entry : { count: 0, since: now };
        fresh.count += 1;
        this.passwordFailures.set(userId, fresh);
        throw new common_1.UnauthorizedException('That password is not correct.');
    }
    async findBlockers(db, user) {
        const blockers = [];
        if (user.role !== 'USER') {
            blockers.push({
                code: 'STAFF_ACCOUNT',
                message: 'Staff accounts cannot be deleted here. Ask another administrator.',
            });
        }
        const [wallets, engineWallets, openEngineTrades, openTrades, withdrawals, deposits] = await Promise.all([
            db.wallet.findMany({ where: { userId: user.id } }),
            db.engineWallet.findMany({ where: { userId: user.id, accountType: 'QT Real' } }),
            db.engineTrade.count({ where: { userId: user.id, status: 'PENDING' } }),
            db.trade.count({ where: { userId: user.id, status: 'OPEN' } }),
            db.withdrawal.count({
                where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
            }),
            db.deposit.count({
                where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
            }),
        ]);
        const available = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
        const locked = wallets.reduce((sum, wallet) => sum + Number(wallet.locked), 0);
        const engineBalance = engineWallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
        const engineLocked = engineWallets.reduce((sum, wallet) => sum + Number(wallet.locked), 0);
        const funds = available + engineBalance;
        if (funds >= account_deletion_constants_1.DUST) {
            blockers.push({
                code: 'FUNDS',
                message: `Your real account still holds ${kes(available)}${engineBalance >= account_deletion_constants_1.DUST ? ' plus funds in trading' : ''}. Withdraw it first so nothing is lost.`,
                action: { label: 'Withdraw funds', path: '/finance?tab=withdraw' },
            });
        }
        if (locked + engineLocked >= account_deletion_constants_1.DUST) {
            blockers.push({
                code: 'LOCKED_FUNDS',
                message: 'Some of your money is reserved for a withdrawal or an open position. Wait until it settles.',
                action: { label: 'View transactions', path: '/finance?tab=history' },
            });
        }
        if (openEngineTrades + openTrades > 0) {
            const count = openEngineTrades + openTrades;
            blockers.push({
                code: 'OPEN_TRADES',
                message: `You have ${count} open trade${count === 1 ? '' : 's'}. Wait until ${count === 1 ? 'it expires' : 'they expire'}.`,
                action: { label: 'View open trades', path: '/open-trades' },
            });
        }
        if (withdrawals > 0) {
            blockers.push({
                code: 'PENDING_WITHDRAWAL',
                message: 'A withdrawal is still being processed. Wait until it is paid or declined.',
                action: { label: 'View transactions', path: '/finance?tab=history' },
            });
        }
        if (deposits > 0) {
            blockers.push({
                code: 'PENDING_DEPOSIT',
                message: 'A deposit is still being confirmed. Wait until it completes or fails.',
                action: { label: 'View transactions', path: '/finance?tab=history' },
            });
        }
        return blockers;
    }
};
exports.AccountDeletionService = AccountDeletionService;
exports.AccountDeletionService = AccountDeletionService = AccountDeletionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], AccountDeletionService);
//# sourceMappingURL=account-deletion.service.js.map