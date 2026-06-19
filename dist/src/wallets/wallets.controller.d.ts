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
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            walletId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    deposit(dto: DepositDto): Promise<{
        message: string;
        wallet: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            userId: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
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
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                subject: string;
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
            userId: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
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
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                subject: string;
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
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
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
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                subject: string;
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
            userId: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
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
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                subject: string;
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
            userId: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
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
                status: import(".prisma/client").$Enums.NotificationStatus;
                createdAt: Date;
                userId: string;
                type: import(".prisma/client").$Enums.NotificationType;
                transactionId: string | null;
                subject: string;
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
