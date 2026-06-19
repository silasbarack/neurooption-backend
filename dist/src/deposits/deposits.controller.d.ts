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
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
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
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            description: string | null;
            userId: string;
            walletId: string;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            accountNumber: string | null;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        walletId: string;
        currency: string;
        transactionId: string;
        gatewayId: string;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
