import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    submit(dto: CreateKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    })[]>;
    pending(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    }>;
    approve(id: string, dto: ReviewKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    }>;
    reject(id: string, dto: ReviewKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rejectionReason: string | null;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        reviewedAt: Date | null;
        reviewedByAdminId: string | null;
    }>;
}
