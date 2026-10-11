import { Body, Controller, Delete, ForbiddenException, Get, Header, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminSuperGuard } from './admin-super.guard';
import { AdminService } from './admin.service';
import { AdminSessionGuard, type AdminIdentity } from './admin-session.guard';
import { TradingMonitorService } from './trading-monitor.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService, private readonly monitor: TradingMonitorService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) { return this.adminService.login(dto); }


  @Get('bootstrap-status')
  @Header('Cache-Control', 'no-store')
  bootstrapStatus() { return this.adminService.bootstrapStatus(); }

  @Post('bootstrap')
  @Header('Cache-Control', 'no-store')
  bootstrapFirstAdmin(@Body() body: { fullName?: string; email?: string; password?: string; setupKey?: string }) {
    return this.adminService.bootstrapFirstAdmin(body);
  }

  @Get('session')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  session(@Req() req: { admin: AdminIdentity }) { return { admin: req.admin }; }

  @Get('trading-monitor')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  tradingMonitor(
    @Req() req: { admin: AdminIdentity },
    @Query() query: { account?: string; status?: string; search?: string; page?: string; limit?: string },
  ) {
    if (!['SUPER_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN', 'FINANCE_ADMIN'].includes(req.admin.role)) {
      throw new ForbiddenException('Trading monitoring permission required.');
    }
    return this.monitor.overview(query);
  }

  @Post()
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  create(@Body() dto: CreateAdminDto) { return this.adminService.create(dto); }

  @Get()
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  findAll() { return this.adminService.findAll(); }

  @Get(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  findOne(@Param('id') id: string) { return this.adminService.findOne(id); }

  @Patch(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) { return this.adminService.update(id, dto); }

  @Patch(':id/disable')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  disable(@Param('id') id: string) { return this.adminService.disable(id); }

  @Patch(':id/enable')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  enable(@Param('id') id: string) { return this.adminService.enable(id); }

  @Delete(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  delete(@Param('id') id: string) { return this.adminService.delete(id); }
}
