export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    BANNED = "BANNED"
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
}
