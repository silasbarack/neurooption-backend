export declare enum KycDecision {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class ReviewKycDto {
    status: KycDecision;
    rejectionReason?: string;
}
