import { NotificationStatus } from '@prisma/client';
export declare class UpdateNotificationStatusDto {
    status: NotificationStatus;
    failureReason?: string;
}
