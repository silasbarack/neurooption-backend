import { TransactionStatus } from '@prisma/client';
export declare class CreatePayoutDto {
    userId: string;
    walletId: string;
    transactionId: string;
    gatewayId?: string;
    tradeId?: string;
    amount: number;
    currency?: string;
    status?: TransactionStatus;
}
