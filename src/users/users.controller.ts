import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Req, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AuthenticatedRequest } from '../auth/authenticated-request';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UsersService, UpdateUserPayload } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertOwner(req: AuthenticatedRequest, userId: string) {
    if (req.user.id !== userId) throw new ForbiddenException('You may only access your own account.');
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() { return this.usersService.findAll(); }

  @Get('me/:userId')
  getMe(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    this.assertOwner(req, userId);
    return this.usersService.getMe(userId);
  }

  @Get(':id')
  findById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    this.assertOwner(req, id);
    return this.usersService.findById(id);
  }

  @Patch('me/:userId')
  updateMe(@Req() req: AuthenticatedRequest, @Param('userId') userId: string, @Body() payload: UpdateUserPayload) {
    this.assertOwner(req, userId);
    return this.usersService.updateMe(userId, payload);
  }

  @Patch(':id')
  updateById(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() payload: UpdateUserPayload) {
    this.assertOwner(req, id);
    return this.usersService.updateMe(id, payload);
  }

  @Delete('me')
  deleteOwnAccount(@Req() req: AuthenticatedRequest, @Body() payload: DeleteAccountDto) {
    return this.usersService.deleteMe(req.user.id, payload);
  }

  @Delete('me/:userId')
  deleteMe(@Req() req: AuthenticatedRequest, @Param('userId') userId: string, @Body() payload: DeleteAccountDto) {
    this.assertOwner(req, userId);
    return this.usersService.deleteMe(userId, payload);
  }

  @Delete(':id')
  deleteById(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() payload: DeleteAccountDto) {
    this.assertOwner(req, id);
    return this.usersService.deleteMe(id, payload);
  }
}
