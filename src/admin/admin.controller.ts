import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) { return this.adminService.login(dto); }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateAdminDto) { return this.adminService.create(dto); }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() { return this.adminService.findAll(); }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id') id: string) { return this.adminService.findOne(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) { return this.adminService.update(id, dto); }

  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, AdminGuard)
  disable(@Param('id') id: string) { return this.adminService.disable(id); }

  @Patch(':id/enable')
  @UseGuards(JwtAuthGuard, AdminGuard)
  enable(@Param('id') id: string) { return this.adminService.enable(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  delete(@Param('id') id: string) { return this.adminService.delete(id); }
}
