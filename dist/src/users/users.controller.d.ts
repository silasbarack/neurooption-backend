import { UsersService, UpdateUserPayload } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any[]>;
    getMe(userId: string): Promise<any>;
    findById(id: string): Promise<any>;
    updateMe(userId: string, payload: UpdateUserPayload): Promise<any>;
    updateById(id: string, payload: UpdateUserPayload): Promise<any>;
    deleteMe(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteById(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
