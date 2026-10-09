import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { UsersService, UpdateUserPayload } from './users.service';

/**
 * Every route needs a signed-in user. The `me/:userId` routes only work for
 * that same user; listing and editing other users is admin-only.
 *
 * There is deliberately no delete route here: closing an account goes
 * through POST /account/delete (password + typed confirmation, funds and
 * open-trade checks, and a confirmation email).
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertSelf(req: AuthenticatedRequest, userId: string) {
    if (req.user?.id !== userId) {
      throw new ForbiddenException('You can only access your own account.');
    }
  }

  @Get()
  @UseGuards(AdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me/:userId')
  async getMe(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    this.assertSelf(req, userId);
    return this.usersService.getMe(userId);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me/:userId')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() payload: UpdateUserPayload,
  ) {
    this.assertSelf(req, userId);
    return this.usersService.updateMe(userId, payload);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  async updateById(
    @Param('id') id: string,
    @Body() payload: UpdateUserPayload,
  ) {
    return this.usersService.updateMe(id, payload);
  }
}
