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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma.service");
const emails_service_1 = require("../emails/emails.service");
const notifications_service_1 = require("../notifications/notifications.service");
let WalletsService = class WalletsService {
    constructor(prisma, emailsService, notificationsService) {
        this.prisma = prisma;
        this.emailsService = emailsService;
        this.notificationsService = notificationsService;
    }
    now() {
        return new Date().toISOString().replace('T', ' ').slice(0, 16);
    }
    generateReference(prefix, userId) {
        return `NO-${prefix}-${userId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    }
    extractMethod(description) {
        if (!description) {
            return 'Selected payment method';
        }
        if (description.includes(' withdrawal request')) {
            return description.replace(' withdrawal request', '').trim();
        }
        if (description.includes(' deposit')) {
            return description.replace(' deposit', '').trim();
        }
        return description.trim();
    }
    async findWithdrawalTransaction(transactionId) {
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                OR: [{ id: transactionId }, { reference: transactionId }],
                type: client_1.TransactionType.WITHDRAWAL,
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Withdrawal transaction not found');
        }
        return transaction;
    }
    async getUserEmail(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.email;
    }
    async getUserWallets(userId) {
        return this.prisma.wallet.findMany({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    async deposit(dto) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                userId: dto.userId,
                currency: dto.currency,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const recipientEmail = await this.getUserEmail(dto.userId);
        const reference = this.generateReference('DEP', dto.userId);
        const updatedWallet = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    increment: dto.amount,
                },
            },
        });
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: dto.userId,
                walletId: wallet.id,
                type: client_1.TransactionType.DEPOSIT,
                status: client_1.TransactionStatus.COMPLETED,
                amount: dto.amount,
                reference,
                description: `${dto.method} deposit`,
            },
        });
        const email = this.emailsService.depositSuccessful({
            amount: dto.amount,
            currency: dto.currency,
            method: dto.method,
            transactionId: reference,
            dateTime: this.now(),
        });
        const notification = await this.notificationsService.create({
            userId: dto.userId,
            type: client_1.NotificationType.DEPOSIT_SUCCESSFUL,
            subject: email.subject,
            body: email.body,
            recipientEmail,
            transactionId: transaction.id,
        });
        return {
            message: 'Deposit successful',
            wallet: updatedWallet,
            transaction,
            email,
            notification,
        };
    }
    async withdraw(dto) {
        const wallet = await this.prisma.wallet.findFirst({
            where: {
                userId: dto.userId,
                currency: dto.currency,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        if (Number(wallet.balance) < dto.amount) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const recipientEmail = await this.getUserEmail(dto.userId);
        const reference = this.generateReference('WDR', dto.userId);
        const updatedWallet = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    decrement: dto.amount,
                },
                locked: {
                    increment: dto.amount,
                },
            },
        });
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: dto.userId,
                walletId: wallet.id,
                type: client_1.TransactionType.WITHDRAWAL,
                status: client_1.TransactionStatus.PENDING,
                amount: dto.amount,
                reference,
                description: `${dto.method} withdrawal request`,
            },
        });
        const email = this.emailsService.withdrawalRequested({
            amount: dto.amount,
            currency: dto.currency,
            method: dto.method,
            transactionId: reference,
            dateTime: this.now(),
        });
        const notification = await this.notificationsService.create({
            userId: dto.userId,
            type: client_1.NotificationType.WITHDRAWAL_REQUESTED,
            subject: email.subject,
            body: email.body,
            recipientEmail,
            transactionId: transaction.id,
        });
        return {
            message: 'Withdrawal request placed',
            wallet: updatedWallet,
            transaction,
            email,
            notification,
        };
    }
    async markWithdrawalProcessing(transactionId) {
        const transaction = await this.findWithdrawalTransaction(transactionId);
        if (transaction.status !== client_1.TransactionStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending withdrawals can be marked as processing');
        }
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: transaction.walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const recipientEmail = await this.getUserEmail(transaction.userId);
        const updatedTransaction = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: client_1.TransactionStatus.PROCESSING,
                description: 'Withdrawal sent to external provider for processing',
            },
        });
        const email = this.emailsService.withdrawalProcessing({
            amount: Number(transaction.amount),
            currency: wallet.currency,
            method: this.extractMethod(transaction.description),
            transactionId: transaction.reference || transaction.id,
            dateTime: this.now(),
        });
        const notification = await this.notificationsService.create({
            userId: transaction.userId,
            type: client_1.NotificationType.WITHDRAWAL_PROCESSING,
            subject: email.subject,
            body: email.body,
            recipientEmail,
            transactionId: transaction.id,
        });
        return {
            message: 'Withdrawal marked as processing',
            transaction: updatedTransaction,
            email,
            notification,
        };
    }
    async completeWithdrawal(transactionId) {
        const transaction = await this.findWithdrawalTransaction(transactionId);
        if (transaction.status !== client_1.TransactionStatus.PENDING &&
            transaction.status !== client_1.TransactionStatus.PROCESSING) {
            throw new common_1.BadRequestException('Only pending or processing withdrawals can be completed');
        }
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: transaction.walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const recipientEmail = await this.getUserEmail(transaction.userId);
        const updatedWallet = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                locked: {
                    decrement: transaction.amount,
                },
            },
        });
        const updatedTransaction = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: client_1.TransactionStatus.COMPLETED,
                description: 'Withdrawal completed successfully',
            },
        });
        const email = this.emailsService.withdrawalCompleted({
            amount: Number(transaction.amount),
            currency: wallet.currency,
            method: this.extractMethod(transaction.description),
            transactionId: transaction.reference || transaction.id,
            dateTime: this.now(),
        });
        const notification = await this.notificationsService.create({
            userId: transaction.userId,
            type: client_1.NotificationType.WITHDRAWAL_COMPLETED,
            subject: email.subject,
            body: email.body,
            recipientEmail,
            transactionId: transaction.id,
        });
        return {
            message: 'Withdrawal completed',
            wallet: updatedWallet,
            transaction: updatedTransaction,
            email,
            notification,
        };
    }
    async rejectWithdrawal(transactionId, dto) {
        const transaction = await this.findWithdrawalTransaction(transactionId);
        if (transaction.status !== client_1.TransactionStatus.PENDING &&
            transaction.status !== client_1.TransactionStatus.PROCESSING) {
            throw new common_1.BadRequestException('Only pending or processing withdrawals can be rejected');
        }
        const wallet = await this.prisma.wallet.findUnique({
            where: { id: transaction.walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const recipientEmail = await this.getUserEmail(transaction.userId);
        const updatedWallet = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: {
                    increment: transaction.amount,
                },
                locked: {
                    decrement: transaction.amount,
                },
            },
        });
        const updatedTransaction = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: client_1.TransactionStatus.REJECTED,
                description: `Withdrawal rejected: ${dto.reason}`,
            },
        });
        const email = this.emailsService.withdrawalDeclined({
            amount: Number(transaction.amount),
            currency: wallet.currency,
            method: this.extractMethod(transaction.description),
            transactionId: transaction.reference || transaction.id,
            dateTime: this.now(),
            reason: dto.reason,
        });
        const notification = await this.notificationsService.create({
            userId: transaction.userId,
            type: client_1.NotificationType.WITHDRAWAL_REJECTED,
            subject: email.subject,
            body: email.body,
            recipientEmail,
            transactionId: transaction.id,
        });
        return {
            message: 'Withdrawal rejected',
            wallet: updatedWallet,
            transaction: updatedTransaction,
            email,
            notification,
        };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService,
        notifications_service_1.NotificationsService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map