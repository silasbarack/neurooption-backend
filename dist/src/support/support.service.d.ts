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
            status: import(".prisma/client").$Enums.AccountStatus;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    }>;
    getTickets(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AccountStatus;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    })[]>;
    getUserTickets(userId: string): Promise<({
        messages: {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    })[]>;
    getTicket(id: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AccountStatus;
            passwordHash: string;
            fullName: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
        };
        messages: {
            message: string;
            id: string;
            createdAt: Date;
            ticketId: string;
            senderId: string;
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    }>;
    sendMessage(dto: CreateSupportMessageDto): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        ticketId: string;
        senderId: string;
        senderRole: import(".prisma/client").$Enums.SupportSenderRole;
    }>;
    updateStatus(id: string, dto: UpdateSupportTicketStatusDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    }>;
    resolveTicket(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    }>;
    closeTicket(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        subject: string;
    }>;
}
