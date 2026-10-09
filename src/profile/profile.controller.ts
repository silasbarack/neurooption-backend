import { Body, Controller, ForbiddenException, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  private assertOwner(req: AuthenticatedRequest, userId: string) {
    if (req.user.id !== userId) throw new ForbiddenException('You may only access your own account.');
  }

  @Get(':userId')
  getProfile(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    this.assertOwner(req, userId);
    return this.profileService.getProfile(userId);
  }

  @Patch(':userId')
  updateProfile(@Req() req: AuthenticatedRequest, @Param('userId') userId: string, @Body() dto: UpdateProfileDto) {
    this.assertOwner(req, userId);
    return this.profileService.updateProfile(userId, dto);
  }

  @Patch(':userId/password')
  changePassword(@Req() req: AuthenticatedRequest, @Param('userId') userId: string, @Body() dto: ChangePasswordDto) {
    this.assertOwner(req, userId);
    return this.profileService.changePassword(userId, dto);
  }
}
