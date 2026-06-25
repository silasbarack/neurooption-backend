import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';
import { DepositsService } from './deposits.service';
export declare class DepositsController {
    private readonly service;
    constructor(service: DepositsService);
    create(dto: CreateDepositDto): Promise<{
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            phone: string;
            fullName: string;
            email: string;
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
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
        };
        gateway: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.PaymentGatewayType;
            isActive: boolean;
            accountNumber: string | null;
            direction: import(".prisma/client").$Enums.PaymentDirection;
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
        userId: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        transactionId: string;
        gatewayId: string;
        phone: string | null;
        accountNumber: string | null;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
