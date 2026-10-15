import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
export type UpdateUserPayload = {
    email?: string;
    fullName?: string;
    name?: string;
    phone?: string;
    country?: string;
    currency?: string;
};
export declare class UsersService {
    private readonly prisma;
    private readonly emails?;
    constructor(prisma: PrismaService, emails?: EmailsService);
    private getUserModelFields;
    private hasUserField;
    private removePassword;
    findAll(): Promise<any[]>;
    findById(userId: string): Promise<any>;
    getMe(userId: string): Promise<any>;
    updateMe(userId: string, payload: UpdateUserPayload): Promise<any>;
    changePassword(userId: string, payload: {
        currentPassword?: string;
        newPassword?: string;
    }): Promise<{
        success: boolean;
        emailSent: boolean;
        message: string;
    }>;
}
