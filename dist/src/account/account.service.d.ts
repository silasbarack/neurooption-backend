import { PrismaService } from '../config/prisma.service';
import { WalletsService } from '../wallets/wallets.service';
export declare function accountNumberFor(userId: string): string;
export declare class AccountService {
    private readonly prisma;
    private readonly wallets;
    constructor(prisma: PrismaService, wallets: WalletsService);
    summary(userId: string): Promise<{
        id: string;
        accountNumber: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        verified: boolean;
        memberSince: Date;
        profile: {
            completion: number;
            checklist: {
                key: string;
                label: string;
                done: boolean;
            }[];
        };
        real: {
            currency: string;
            balance: number;
            locked: number;
        };
        demo: {
            currency: string;
            balance: number;
        };
    }>;
}
