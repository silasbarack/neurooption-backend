import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { UsersService, UpdateUserPayload } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    private assertSelf;
    profile(req: AuthenticatedRequest): Promise<any>;
    updateProfile(req: AuthenticatedRequest, payload: UpdateUserPayload): Promise<any>;
    changePassword(req: AuthenticatedRequest, payload: {
        currentPassword?: string;
        newPassword?: string;
    }): Promise<{
        success: boolean;
        emailSent: boolean;
        message: string;
    }>;
    findAll(): Promise<any[]>;
    getMe(req: AuthenticatedRequest, userId: string): Promise<any>;
    findById(id: string): Promise<any>;
    updateMe(req: AuthenticatedRequest, userId: string, payload: UpdateUserPayload): Promise<any>;
    updateById(id: string, payload: UpdateUserPayload): Promise<any>;
}
