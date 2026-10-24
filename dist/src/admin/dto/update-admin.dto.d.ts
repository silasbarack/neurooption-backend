import { AdminRole } from './create-admin.dto';
export declare class UpdateAdminDto {
    fullName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    role?: AdminRole;
}
