import { PrismaService } from '../config/prisma.service';
export type UpdateUserPayload = {
    fullName?: string;
    name?: string;
    phone?: string;
    country?: string;
    currency?: string;
};
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getUserModelFields;
    private hasUserField;
    private removePassword;
    findAll(): Promise<any[]>;
    findById(userId: string): Promise<any>;
    getMe(userId: string): Promise<any>;
    updateMe(userId: string, payload: UpdateUserPayload): Promise<any>;
}
