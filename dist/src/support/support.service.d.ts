import { PrismaService } from '../config/prisma.service';
export declare class SupportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listMine(userId: string): Promise<{
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
    getMine(userId: string, id: string): Promise<{
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
    create(userId: string, body: {
        subject?: unknown;
        message?: unknown;
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
    reply(userId: string, id: string, body: {
        message?: unknown;
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
