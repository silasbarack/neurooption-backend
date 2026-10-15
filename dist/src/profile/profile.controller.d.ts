import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    private assertSelf;
    getProfile(req: AuthenticatedRequest, userId: string): Promise<any>;
    updateProfile(req: AuthenticatedRequest, userId: string, dto: UpdateProfileDto): Promise<any>;
    changePassword(req: AuthenticatedRequest, userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
        emailSent: boolean;
    }>;
}
