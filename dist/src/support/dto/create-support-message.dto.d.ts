import { SupportSenderRole } from '@prisma/client';
export declare class CreateSupportMessageDto {
    ticketId: string;
    senderId: string;
    senderRole: SupportSenderRole;
    message: string;
}
