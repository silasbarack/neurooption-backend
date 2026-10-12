import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { SupportService } from './support.service';
export declare class SupportController {
    private readonly support;
    constructor(support: SupportService);
    list(req: AuthenticatedRequest): Promise<{
        id: string;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        messages: number;
        lastMessage: {
            id: string;
            createdAt: Date;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        };
    }[]>;
    create(req: AuthenticatedRequest, body: {
        subject?: string;
        message?: string;
    }): Promise<{
        id: string;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        messages: {
            id: string;
            createdAt: Date;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    }>;
    get(req: AuthenticatedRequest, id: string): Promise<{
        id: string;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        messages: {
            id: string;
            createdAt: Date;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    }>;
    reply(req: AuthenticatedRequest, id: string, body: {
        message?: string;
    }): Promise<{
        id: string;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        messages: {
            id: string;
            createdAt: Date;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    }>;
}
