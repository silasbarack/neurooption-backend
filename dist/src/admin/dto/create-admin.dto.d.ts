export declare enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    FINANCE_ADMIN = "FINANCE_ADMIN",
    SUPPORT_ADMIN = "SUPPORT_ADMIN",
    KYC_ADMIN = "KYC_ADMIN",
    RISK_ADMIN = "RISK_ADMIN",
    COMPLIANCE_ADMIN = "COMPLIANCE_ADMIN"
}
export declare class CreateAdminDto {
    fullName: string;
    email: string;
    password: string;
    role: AdminRole;
    phone?: string;
}
