import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
export declare class SupportController {
    private readonly supportService;
    constructor(supportService: SupportService);
    createTicket(dto: CreateSupportTicketDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
    getTickets(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    })[]>;
    getTicket(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            referralCode: string | null;
            fullName: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referredById: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
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
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    })[]>;
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
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
    resolve(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
    close(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
}
