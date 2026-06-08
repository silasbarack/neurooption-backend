import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateAffiliateCommissionDto } from './dto/create-affiliate-commission.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';
export declare class AffiliatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            amount: Prisma.Decimal;
            rate: Prisma.Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            rate: Prisma.Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            rate: Prisma.Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            rate: Prisma.Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
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
            amount: Prisma.Decimal;
            rate: Prisma.Decimal;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        rate: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        rate: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        rate: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        rate: Prisma.Decimal;
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
            amount: Prisma.Decimal;
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
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        rate: Prisma.Decimal;
        paidAt: Date | null;
    }>;
    private affiliateInclude;
    private commissionInclude;
}
