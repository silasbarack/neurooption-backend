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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        userId: string;
    })[]>;
    deposit(dto: DepositDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            userId: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                createdAt: Date;
                subject: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                kycRecordId: string | null;
                supportTicketId: string | null;
                sentAt: Date | null;
            };
        };
    }>;
    withdraw(dto: WithdrawDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            userId: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                createdAt: Date;
                subject: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                kycRecordId: string | null;
                supportTicketId: string | null;
                sentAt: Date | null;
            };
        };
    }>;
    markWithdrawalProcessing(transactionId: string): Promise<{
        message: string;
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                createdAt: Date;
                subject: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                kycRecordId: string | null;
                supportTicketId: string | null;
                sentAt: Date | null;
            };
        };
    }>;
    completeWithdrawal(transactionId: string): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            userId: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                createdAt: Date;
                subject: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                kycRecordId: string | null;
                supportTicketId: string | null;
                sentAt: Date | null;
            };
        };
    }>;
    rejectWithdrawal(transactionId: string, dto: RejectWithdrawalDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            userId: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        email: {
            subject: string;
            body: string;
        };
        notification: {
            message: string;
            notification: {
                id: string;
                createdAt: Date;
                subject: string;
                status: import(".prisma/client").$Enums.NotificationStatus;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                channel: import(".prisma/client").$Enums.NotificationChannel;
                body: string;
                recipientEmail: string;
                kycRecordId: string | null;
                supportTicketId: string | null;
                sentAt: Date | null;
            };
        };
    }>;
}
