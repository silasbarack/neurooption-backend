import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateCommissionDto } from './dto/create-affiliate-commission.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
export declare class AffiliatesController {
    private readonly affiliatesService;
    constructor(affiliatesService: AffiliatesService);
    createAffiliate(dto: CreateAffiliateDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllAffiliates(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findAffiliateById(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAffiliateByUser(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateAffiliate(id: string, dto: UpdateAffiliateDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    createCommission(dto: CreateAffiliateCommissionDto): Promise<{
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
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
    findAllCommissions(): Promise<({
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
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    })[]>;
    findCommissionsByAffiliate(affiliateId: string): Promise<({
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
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    })[]>;
    updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto): Promise<{
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
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
    payCommission(id: string, walletId: string): Promise<{
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
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
}
