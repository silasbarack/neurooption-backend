import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService, UpdateUserPayload } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me/:userId')
  async getMe(@Param('userId') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch('me/:userId')
  async updateMe(
    @Param('userId') userId: string,
    @Body() payload: UpdateUserPayload,
  ) {
    return this.usersService.updateMe(userId, payload);
  }

  @Patch(':id')
  async updateById(
    @Param('id') id: string,
    @Body() payload: UpdateUserPayload,
  ) {
    return this.usersService.updateMe(id, payload);
  }

  @Delete('me/:userId')
  async deleteMe(@Param('userId') userId: string) {
    return this.usersService.deleteMe(userId);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.usersService.deleteMe(id);
  }
}