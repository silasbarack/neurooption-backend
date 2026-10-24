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
            fullName: string;
            email: string;
            phone: string;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        commissions: {
            id: string;
            status: import(".prisma/client").$Enums.CommissionStatus;
            createdAt: Date;
            updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        referredUser: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: Prisma.Decimal;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        referredUser: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: Prisma.Decimal;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        referredUser: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: Prisma.Decimal;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        referredUser: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: Prisma.Decimal;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
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
            fullName: string;
            email: string;
            phone: string;
        };
        referredUser: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
        };
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            amount: Prisma.Decimal;
            walletId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            reference: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CommissionStatus;
        createdAt: Date;
        updatedAt: Date;
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
