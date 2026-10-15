import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly prisma;
    private readonly emails?;
    constructor(prisma: PrismaService, emails?: EmailsService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
        emailSent: boolean;
    }>;
    private sanitizeUser;
}
