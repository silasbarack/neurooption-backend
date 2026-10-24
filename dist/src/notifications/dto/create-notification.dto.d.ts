import { NotificationChannel, NotificationType } from '@prisma/client';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    channel?: NotificationChannel;
    subject: string;
    body: string;
    recipientEmail: string;
    transactionId?: string;
    kycRecordId?: string;
    supportTicketId?: string;
}
