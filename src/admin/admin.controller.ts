import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AdminService } from './admin.service';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateAdminDto,
  ) {
    return this.adminService.create(dto);
  }

  @Post('login')
  login(
    @Body() dto: AdminLoginDto,
  ) {
    return this.adminService.login(dto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.update(id, dto);
  }

  @Patch(':id/disable')
  disable(
    @Param('id') id: string,
  ) {
    return this.adminService.disable(id);
  }

  @Patch(':id/enable')
  enable(
    @Param('id') id: string,
  ) {
    return this.adminService.enable(id);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ) {
    return this.adminService.delete(id);
  }
}