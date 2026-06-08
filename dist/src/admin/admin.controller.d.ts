import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    create(dto: CreateAdminDto): Promise<any>;
    login(dto: AdminLoginDto): Promise<{
        message: string;
        adminId: any;
        role: any;
    }>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateAdminDto): Promise<any>;
    disable(id: string): Promise<any>;
    enable(id: string): Promise<any>;
    delete(id: string): Promise<any>;
}
