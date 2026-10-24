import { SocialFollowStatus } from '@prisma/client';
export declare class UpdateSocialFollowDto {
    status?: SocialFollowStatus;
    copyPercentage?: number;
    maxStakeAmount?: number;
    minStakeAmount?: number;
}
