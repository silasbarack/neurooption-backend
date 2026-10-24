import { TransactionStatus } from '@prisma/client';
export declare class UpdateWithdrawalStatusDto {
    status: TransactionStatus;
    externalRef?: string;
    rejectionReason?: string;
}
