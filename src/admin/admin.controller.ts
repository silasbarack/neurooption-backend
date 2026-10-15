import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminSuperGuard } from './admin-super.guard';
import { AdminService } from './admin.service';
import { AdminSessionGuard, type AdminIdentity } from './admin-session.guard';
import { TradingMonitorService } from './trading-monitor.service';
import { AdminConsoleService } from './admin-console.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

type AdminReq = { admin: AdminIdentity };

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly monitor: TradingMonitorService,
    private readonly console: AdminConsoleService,
  ) {}

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

  @Post('bootstrap/reset-password')
  @Header('Cache-Control', 'no-store')
  bootstrapResetPassword(@Body() body: { email?: string; password?: string; setupKey?: string }) {
    return this.adminService.bootstrapResetPassword(body);
  }

  @Get('session')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  session(@Req() req: { admin: AdminIdentity }) {
    return { admin: req.admin, permissions: this.console.permissionsFor(req.admin.role) };
  }

  @Get('trading-monitor')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  tradingMonitor(
    @Req() req: { admin: AdminIdentity },
    @Query() query: { account?: string; status?: string; search?: string; page?: string; limit?: string },
  ) {
    this.console.assertCan(req.admin, 'trading');
    return this.monitor.overview(query);
  }

  // ---- Console areas (role-scoped) ----

  @Get('console/overview')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  overview(@Req() req: AdminReq) {
    this.console.assertCan(req.admin, 'overview');
    return this.console.overview();
  }

  @Get('console/users')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  users(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'users');
    return this.console.listUsers(query);
  }

  @Get('console/users/:id')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  user(@Req() req: AdminReq, @Param('id') id: string) {
    this.console.assertCan(req.admin, 'users');
    return this.console.userDetail(id);
  }

  @Patch('console/users/:id/status')
  @UseGuards(AdminSessionGuard)
  userStatus(@Req() req: AdminReq, @Param('id') id: string, @Body() body: { status?: string; reason?: string }) {
    this.console.assertCan(req.admin, 'userStatus');
    return this.console.setUserStatus(req.admin, id, body);
  }

  @Get('console/kyc')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  kyc(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'kyc');
    return this.console.listKyc(query);
  }

  @Patch('console/kyc/:id')
  @UseGuards(AdminSessionGuard)
  reviewKyc(@Req() req: AdminReq, @Param('id') id: string, @Body() body: { decision?: string; reason?: string }) {
    this.console.assertCan(req.admin, 'kyc');
    return this.console.reviewKyc(req.admin, id, body);
  }

  @Get('console/finance')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  finance(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'finance');
    return this.console.listFinance(query);
  }

  @Get('console/support')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  tickets(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'support');
    return this.console.listTickets(query);
  }

  @Get('console/support/:id')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  ticket(@Req() req: AdminReq, @Param('id') id: string) {
    this.console.assertCan(req.admin, 'support');
    return this.console.ticketDetail(id);
  }

  @Patch('console/support/:id/status')
  @UseGuards(AdminSessionGuard)
  ticketStatus(@Req() req: AdminReq, @Param('id') id: string, @Body() body: { status?: string }) {
    this.console.assertCan(req.admin, 'support');
    return this.console.setTicketStatus(req.admin, id, body);
  }

  @Post('console/support/:id/reply')
  @UseGuards(AdminSessionGuard)
  replyTicket(@Req() req: AdminReq, @Param('id') id: string, @Body() body: { message?: string; close?: boolean }) {
    this.console.assertCan(req.admin, 'support');
    return this.console.replyToTicket(req.admin, id, body);
  }

  @Get('console/emails')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  emailLog(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'emails');
    return this.console.listEmails(query);
  }

  @Get('console/emails/health')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  emailHealth(@Req() req: AdminReq) {
    this.console.assertCan(req.admin, 'emails');
    return this.console.emailHealth();
  }

  @Post('console/emails/test')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  emailTest(@Req() req: AdminReq, @Body() body: { to?: string }) {
    return this.console.sendTestEmail(req.admin, body);
  }

  @Get('console/audit')
  @UseGuards(AdminSessionGuard)
  @Header('Cache-Control', 'private, no-store')
  auditLog(@Req() req: AdminReq, @Query() query: Record<string, string>) {
    this.console.assertCan(req.admin, 'audit');
    return this.console.listAudit(query);
  }

  // ---- Team (Super Administrator only) ----

  @Post()
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  async create(@Req() req: AdminReq, @Body() dto: CreateAdminDto) {
    const admin = await this.adminService.create(dto);
    await this.console.logTeamChange(req.admin, 'ADMIN_CREATED', admin.id, `${admin.email} added as ${admin.role}`);
    return admin;
  }

  @Get()
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  findAll() { return this.adminService.findAll(); }

  @Get(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  findOne(@Param('id') id: string) { return this.adminService.findOne(id); }

  @Patch(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  async update(@Req() req: AdminReq, @Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const admin = await this.adminService.update(req.admin.id, id, dto);
    await this.console.logTeamChange(req.admin, 'ADMIN_UPDATED', id, `${admin.email} updated (${admin.role}, ${admin.isActive ? 'active' : 'disabled'})`);
    return admin;
  }

  @Patch(':id/disable')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  async disable(@Req() req: AdminReq, @Param('id') id: string) {
    const admin = await this.adminService.disable(req.admin.id, id);
    await this.console.logTeamChange(req.admin, 'ADMIN_DISABLED', id, `${admin.email} disabled`);
    return admin;
  }

  @Patch(':id/enable')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  async enable(@Req() req: AdminReq, @Param('id') id: string) {
    const admin = await this.adminService.enable(id);
    await this.console.logTeamChange(req.admin, 'ADMIN_ENABLED', id, `${admin.email} enabled`);
    return admin;
  }

  @Delete(':id')
  @UseGuards(AdminSessionGuard, AdminSuperGuard)
  async delete(@Req() req: AdminReq, @Param('id') id: string) {
    const admin = await this.adminService.delete(req.admin.id, id);
    await this.console.logTeamChange(req.admin, 'ADMIN_REMOVED', id, `${admin.email} removed`);
    return admin;
  }
}
