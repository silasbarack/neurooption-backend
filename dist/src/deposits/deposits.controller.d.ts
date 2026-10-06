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
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateStatus(id: string, dto: UpdateDepositStatusDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markCompleted(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markFailed(id: string, externalRef?: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullName: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.TransactionType;
            status: import(".prisma/client").$Enums.TransactionStatus;
            userId: string;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            reference: string | null;
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
        status: import(".prisma/client").$Enums.TransactionStatus;
        userId: string;
        transactionId: string;
        phone: string | null;
        currency: string;
        accountNumber: string | null;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        gatewayId: string;
        checkoutId: string | null;
        externalRef: string | null;
        gatewayRaw: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
