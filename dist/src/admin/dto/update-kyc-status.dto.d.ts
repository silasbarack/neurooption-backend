export declare enum KycStatus {
    NOT_SUBMITTED = "NOT_SUBMITTED",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class UpdateKycStatusDto {
    status: KycStatus;
    rejectionReason?: string;
}
