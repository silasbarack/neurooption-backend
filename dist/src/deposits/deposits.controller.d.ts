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
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
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
            type: import(".prisma/client").$Enums.TransactionType;
            userId: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            walletId: string;
        };
        gateway: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
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
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        status: import(".prisma/client").$Enums.TransactionStatus;
        currency: string;
        userId: string;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        externalRef: string | null;
        accountNumber: string | null;
        gatewayId: string;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
        checkoutId: string | null;
    }>;
}
