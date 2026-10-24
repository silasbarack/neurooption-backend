import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
export declare class NewsletterService {
    private readonly prisma;
    private readonly emails;
    private readonly logger;
    private readonly attempts;
    constructor(prisma: PrismaService, emails: EmailsService);
    private throttle;
    subscribe(body: {
        email?: unknown;
        source?: unknown;
    }, ip: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribe(body: {
        token?: unknown;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
