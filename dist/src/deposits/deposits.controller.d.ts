import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositsService } from './deposits.service';
export declare class DepositsController {
    private readonly service;
    constructor(service: DepositsService);
    create(dto: CreateDepositDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
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
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
            accountNumber: string | null;
            shortcode: string | null;
            paybill: string | null;
            tillNumber: string | null;
            merchantId: string | null;
            environment: string;
        };
    } & {
        id: string;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
}
