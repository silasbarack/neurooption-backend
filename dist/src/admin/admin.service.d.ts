import { PrismaService } from '../config/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAdminDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    login(dto: AdminLoginDto): Promise<{
        message: string;
        adminId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    update(id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    disable(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    enable(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
}
