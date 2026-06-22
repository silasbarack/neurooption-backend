import { Strategy } from 'passport-jwt';
import { PrismaService } from '../config/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AccountStatus;
        fullName: string;
        email: string;
        phone: string | null;
        referralCode: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        referredById: string | null;
    }>;
}
export {};
