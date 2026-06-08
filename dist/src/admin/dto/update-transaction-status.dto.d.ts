export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare class UpdateTransactionStatusDto {
    status: TransactionStatus;
    description: any;
}
