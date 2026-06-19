import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    create(dto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    login(dto: AdminLoginDto): Promise<{
        message: string;
        adminId: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    disable(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    enable(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
}
