import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    create(dto: CreateAdminDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    update(id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    disable(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    enable(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    delete(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
        fullName: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
}
