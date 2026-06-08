import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserKycStatusDto } from './dto/update-user-kyc-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Public signup endpoint
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateUserDto): Promise<any> {
    return this.usersService.create(dto);
  }

  // Protected listing with pagination and optional search
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('q') q?: string,
  ): Promise<any> {
    return this.usersService.findAll({ page, limit, q });
  }

  // Protected get-by-id
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<any> {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<any> {
    return this.usersService.updateStatus(id, dto);
  }

  @Patch(':id/kyc-status')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateKycStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserKycStatusDto,
  ): Promise<any> {
    return this.usersService.updateKycStatus(id, dto);
  }

  @Patch(':id/suspend')
  @UseGuards(AuthGuard('jwt'))
  async suspend(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.usersService.suspend(id);
  }

  @Patch(':id/lock')
  @UseGuards(AuthGuard('jwt'))
  async lock(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.usersService.lock(id);
  }

  @Patch(':id/activate')
  @UseGuards(AuthGuard('jwt'))
  async activate(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.usersService.activate(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.usersService.remove(id);
  }
}
