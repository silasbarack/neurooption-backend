import { TransactionStatus } from '@prisma/client';
export declare class UpdateDepositStatusDto {
    status: TransactionStatus;
    externalRef?: string;
}
