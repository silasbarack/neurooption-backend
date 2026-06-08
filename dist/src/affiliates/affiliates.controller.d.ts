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
            phone: string | null;
            fullname: never;
        };
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            description: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            phone: string | null;
            fullname: never;
        };
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            description: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            phone: string | null;
            fullname: never;
        };
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            description: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            phone: string | null;
            fullname: never;
        };
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            description: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
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
            phone: string | null;
            fullname: never;
        };
        commissions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.CommissionStatus;
            description: string | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
            transactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: import("@prisma/client/runtime/library").Decimal;
        totalEarned: import("@prisma/client/runtime/library").Decimal;
        totalPaid: import("@prisma/client/runtime/library").Decimal;
    }>;
    createCommission(dto: CreateAffiliateCommissionDto): Promise<{
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
        } | null;
        affiliate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        description: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
    findAllCommissions(): Promise<({
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
        } | null;
        affiliate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        description: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    })[]>;
    findCommissionsByAffiliate(affiliateId: string): Promise<({
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
        } | null;
        affiliate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        description: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    })[]>;
    updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto): Promise<{
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
        } | null;
        affiliate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        description: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
    payCommission(id: string, walletId: string): Promise<{
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
        } | null;
        affiliate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            userId: string;
            code: string;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            totalEarned: import("@prisma/client/runtime/library").Decimal;
            totalPaid: import("@prisma/client/runtime/library").Decimal;
        };
        affiliateUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
        referredUser: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        description: string | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
        transactionId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        rate: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
    }>;
}
