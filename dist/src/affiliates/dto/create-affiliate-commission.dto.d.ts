export declare class CreateAffiliateCommissionDto {
    affiliateId: string;
    affiliateUserId: string;
    referredUserId: string;
    transactionId?: string;
    amount: number;
    commissionPercentage: number;
    description?: string;
}
