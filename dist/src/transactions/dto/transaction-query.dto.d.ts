import { TransactionStatus, TransactionType } from './create-transaction.dto';
export declare class TransactionQueryDto {
    userId?: string;
    walletId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
}
