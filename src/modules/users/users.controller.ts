import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeleteAccountDto } from '../auth/dto/password-reset.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) { return this.usersService.getProfile(req.user.id); }

  @Patch('profile')
  updateProfile(@Request() req, @Body() body: any) {
    return this.usersService['repo'].update(req.user.id, { name: body.name, phone: body.phone, country: body.country });
  }

  @Delete('me')
  @HttpCode(200)
  deleteAccount(@Request() req, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(req.user.id, dto.password);
  }
}
