import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
type RegisterPayload = {
    fullName?: string;
    name?: string;
    email: string;
    password: string;
};
type LoginPayload = {
    email: string;
    password: string;
};
type ForgotPasswordPayload = {
    email: string;
};
type ResetPasswordPayload = {
    token: string;
    password: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly emailsService;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, emailsService: EmailsService, configService: ConfigService);
    private normalizeEmail;
    private getFrontendUrl;
    private getUserModelFields;
    private getPasswordFieldName;
    private getNameFieldName;
    private getUserDisplayName;
    private removeSensitiveFields;
    private signToken;
    private sendEmailSafely;
    register(payload: RegisterPayload): Promise<{
        success: boolean;
        message: string;
        token: string;
        accessToken: string;
        user: any;
    }>;
    login(payload: LoginPayload): Promise<{
        success: boolean;
        message: string;
        token: string;
        accessToken: string;
        user: any;
    }>;
    forgotPassword(payload: ForgotPasswordPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(payload: ResetPasswordPayload): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
