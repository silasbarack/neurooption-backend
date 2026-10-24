import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    submit(req: {
        user: {
            id: string;
        };
    }, dto: CreateKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    })[]>;
    pending(): Promise<({
        user: {
            id: string;
            fullName: string;
            email: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    }>;
    approve(id: string, dto: ReviewKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    }>;
    reject(id: string, dto: ReviewKycDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.KycStatus;
        createdAt: Date;
        updatedAt: Date;
        documentType: string;
        documentNumber: string | null;
        frontImageUrl: string | null;
        backImageUrl: string | null;
        selfieImageUrl: string | null;
        addressProofUrl: string | null;
        rejectionReason: string | null;
        reviewedAt: Date | null;
        userId: string;
        reviewedByAdminId: string | null;
    }>;
}
