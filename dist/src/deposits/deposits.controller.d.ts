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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
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
            userId: string;
            currency: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            locked: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        transaction: {
            description: string | null;
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        phone: string | null;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        gatewayId: string;
        checkoutId: string | null;
    }>;
}
