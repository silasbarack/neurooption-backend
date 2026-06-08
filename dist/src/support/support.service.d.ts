import { PrismaService } from '../config/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
export declare class SupportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTicket(dto: CreateSupportTicketDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    }>;
    getTickets(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    })[]>;
    getUserTickets(userId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    })[]>;
    getTicket(id: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    }>;
    sendMessage(dto: CreateSupportMessageDto): Promise<{
        id: string;
        createdAt: Date;
        ticketId: string;
        senderId: string;
        senderRole: import(".prisma/client").$Enums.SupportSenderRole;
        message: string;
    }>;
    updateStatus(id: string, dto: UpdateSupportTicketStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    }>;
    resolveTicket(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    }>;
    closeTicket(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        subject: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        userId: string;
    }>;
}
