import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositsService } from './deposits.service';
export declare class DepositsController {
    private readonly service;
    constructor(service: DepositsService);
    create(dto: CreateDepositDto): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
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
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            accountNumber: string | null;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            direction: import(".prisma/client").$Enums.PaymentDirection;
            isActive: boolean;
            publicKey: string | null;
            secretKey: string | null;
            callbackUrl: string | null;
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
        walletId: string;
        gatewayId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
