export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    TRADE_STAKE = "TRADE_STAKE",
    TRADE_PROFIT = "TRADE_PROFIT",
    BONUS = "BONUS",
    REFUND = "REFUND",
    ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class CreateTransactionDto {
    userId: string;
    walletId: string;
    type: TransactionType;
    amount: number;
    status?: TransactionStatus;
    reference?: string;
    description?: string;
}
