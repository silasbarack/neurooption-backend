import { PrismaService } from '../common/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
export declare class WalletsService {
    private readonly prisma;
    private readonly emailsService;
    private readonly notificationsService;
    constructor(prisma: PrismaService, emailsService: EmailsService, notificationsService: NotificationsService);
    private now;
    private generateReference;
    private extractMethod;
    private findWithdrawalTransaction;
    private getUserEmail;
    getUserWallets(userId: string): Promise<({
        transactions: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    deposit(dto: DepositDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                subject: string;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                sentAt: Date | null;
                transactionId: string | null;
                kycRecordId: string | null;
                supportTicketId: string | null;
            };
        };
    }>;
    withdraw(dto: WithdrawDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                subject: string;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                sentAt: Date | null;
                transactionId: string | null;
                kycRecordId: string | null;
                supportTicketId: string | null;
            };
        };
    }>;
    markWithdrawalProcessing(transactionId: string): Promise<{
        message: string;
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                subject: string;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                sentAt: Date | null;
                transactionId: string | null;
                kycRecordId: string | null;
                supportTicketId: string | null;
            };
        };
    }>;
    completeWithdrawal(transactionId: string): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                subject: string;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                sentAt: Date | null;
                transactionId: string | null;
                kycRecordId: string | null;
                supportTicketId: string | null;
            };
        };
    }>;
    rejectWithdrawal(transactionId: string, dto: RejectWithdrawalDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                subject: string;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                sentAt: Date | null;
                transactionId: string | null;
                kycRecordId: string | null;
                supportTicketId: string | null;
            };
        };
    }>;
}
