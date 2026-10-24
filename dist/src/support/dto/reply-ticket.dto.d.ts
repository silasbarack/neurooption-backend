import { SupportSenderRole } from '@prisma/client';
export declare class ReplyTicketDto {
    senderId: string;
    senderRole: SupportSenderRole;
    message: string;
}
