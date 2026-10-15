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
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            transactionId: string | null;
            amount: Prisma.Decimal;
            description: string | null;
            rate: Prisma.Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
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
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            transactionId: string | null;
            amount: Prisma.Decimal;
            description: string | null;
            rate: Prisma.Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
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
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            transactionId: string | null;
            amount: Prisma.Decimal;
            description: string | null;
            rate: Prisma.Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
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
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            transactionId: string | null;
            amount: Prisma.Decimal;
            description: string | null;
            rate: Prisma.Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
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
            phone: string;
            fullname: never;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
            transactionId: string | null;
            amount: Prisma.Decimal;
            description: string | null;
            rate: Prisma.Decimal;
            paidAt: Date | null;
            affiliateId: string;
            affiliateUserId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AffiliateStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        code: string;
        commissionRate: Prisma.Decimal;
        totalEarned: Prisma.Decimal;
        totalPaid: Prisma.Decimal;
    }>;
    createCommission(dto: CreateAffiliateCommissionDto): Promise<{
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        transactionId: string | null;
        amount: Prisma.Decimal;
        description: string | null;
        rate: Prisma.Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
    findAllCommissions(): Promise<({
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        transactionId: string | null;
        amount: Prisma.Decimal;
        description: string | null;
        rate: Prisma.Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    })[]>;
    findCommissionsByAffiliate(affiliateId: string): Promise<({
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        transactionId: string | null;
        amount: Prisma.Decimal;
        description: string | null;
        rate: Prisma.Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    })[]>;
    updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto): Promise<{
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        transactionId: string | null;
        amount: Prisma.Decimal;
        description: string | null;
        rate: Prisma.Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
    payCommission(id: string, walletId: string): Promise<{
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            walletId: string;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
            description: string | null;
        };
        affiliate: {
            id: string;
            status: import(".prisma/client").$Enums.AffiliateStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            code: string;
            commissionRate: Prisma.Decimal;
            totalEarned: Prisma.Decimal;
            totalPaid: Prisma.Decimal;
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
        transactionId: string | null;
        amount: Prisma.Decimal;
        description: string | null;
        rate: Prisma.Decimal;
        paidAt: Date | null;
        affiliateId: string;
        affiliateUserId: string;
        referredUserId: string;
    }>;
    private affiliateInclude;
    private commissionInclude;
}
