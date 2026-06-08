import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserKycStatusDto } from './dto/update-user-kyc-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<any>;
    findAll(page?: number, limit?: number, q?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateUserDto): Promise<any>;
    updateStatus(id: string, dto: UpdateUserStatusDto): Promise<any>;
    updateKycStatus(id: string, dto: UpdateUserKycStatusDto): Promise<any>;
    suspend(id: string): Promise<any>;
    lock(id: string): Promise<any>;
    activate(id: string): Promise<any>;
    remove(id: string): Promise<any>;
}
