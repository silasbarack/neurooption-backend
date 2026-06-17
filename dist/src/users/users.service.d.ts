import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
export type UpdateUserPayload = {
    fullName?: string;
    name?: string;
    phone?: string;
    country?: string;
    currency?: string;
};
export declare class UsersService {
    private readonly prisma;
    private readonly emailsService;
    private readonly logger;
    constructor(prisma: PrismaService, emailsService: EmailsService);
    private getUserModelFields;
    private hasUserField;
    private removePassword;
    private getUserDisplayName;
    private sendAccountDeletedEmailSafely;
    findAll(): Promise<any[]>;
    findById(userId: string): Promise<any>;
    getMe(userId: string): Promise<any>;
    updateMe(userId: string, payload: UpdateUserPayload): Promise<any>;
    deleteMe(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
