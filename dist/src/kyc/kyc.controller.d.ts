import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    submit(dto: CreateKycDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
            createdAt: Date;
            updatedAt: Date;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
            createdAt: Date;
            updatedAt: Date;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
            createdAt: Date;
            updatedAt: Date;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.KycStatus;
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
