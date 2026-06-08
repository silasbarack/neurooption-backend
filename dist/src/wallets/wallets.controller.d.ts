import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getWallets(userId: string): Promise<({
        transactions: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
        }[];
    } & {
        id: string;
        userId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    deposit(dto: DepositDto): Promise<{
        message: string;
        wallet: {
            id: string;
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
                userId: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.NotificationType;
                status: import(".prisma/client").$Enums.NotificationStatus;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                subject: string;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
                userId: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.NotificationType;
                status: import(".prisma/client").$Enums.NotificationStatus;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                subject: string;
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
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
                userId: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.NotificationType;
                status: import(".prisma/client").$Enums.NotificationStatus;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                subject: string;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
                userId: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.NotificationType;
                status: import(".prisma/client").$Enums.NotificationStatus;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                subject: string;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
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
                userId: string;
                createdAt: Date;
                type: import(".prisma/client").$Enums.NotificationType;
                status: import(".prisma/client").$Enums.NotificationStatus;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                subject: string;
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
