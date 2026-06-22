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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            amount: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            transactionId: string | null;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    createCommission(dto: CreateAffiliateCommissionDto): Promise<{
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
        affiliate: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
    findAllCommissions(): Promise<({
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
        affiliate: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    })[]>;
    findCommissionsByAffiliate(affiliateId: string): Promise<({
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
        affiliate: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    })[]>;
    updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto): Promise<{
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
        affiliate: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
    payCommission(id: string, walletId: string): Promise<{
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
        affiliate: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        transactionId: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
}
