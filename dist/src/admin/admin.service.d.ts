import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    create(dto: CreateAdminDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private readonly loginFailures;
    login(dto: AdminLoginDto): Promise<{
        message: string;
        token: string;
        adminId: string;
        role: import(".prisma/client").$Enums.AdminRole;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        };
    }>;
    private ownerAuthorization;
    private requireOwner;
    private assertStrongPassword;
    bootstrapStatus(): Promise<{
        available: boolean;
        mode?: 'create' | 'reset';
    }>;
    bootstrapFirstAdmin(body: {
        fullName?: string;
        email?: string;
        password?: string;
        setupKey?: string;
    }): Promise<{
        success: boolean;
        message: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    bootstrapResetPassword(body: {
        email?: string;
        password?: string;
        setupKey?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private guardTeamChange;
    update(actorId: string, id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    disable(actorId: string, id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    enable(id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(actorId: string, id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        role: import(".prisma/client").$Enums.AdminRole;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
