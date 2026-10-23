import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin access required');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics' })
  getStats(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Request() req, @Query('page') page = 1, @Query('limit') limit = 50) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers(+page, +limit);
  }

  @Get('withdrawals/pending')
  @ApiOperation({ summary: 'List pending withdrawals' })
  getPendingWithdrawals(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getPendingWithdrawals();
  }

  @Put('withdrawals/:txId/approve')
  @ApiOperation({ summary: 'Approve a withdrawal' })
  approveWithdrawal(@Request() req, @Param('txId') txId: string) {
    this.checkAdmin(req);
    return this.adminService.approveWithdrawal(txId);
  }

  @Put('withdrawals/:txId/reject')
  @ApiOperation({ summary: 'Reject a withdrawal' })
  rejectWithdrawal(@Request() req, @Param('txId') txId: string, @Body() body: { reason: string }) {
    this.checkAdmin(req);
    return this.adminService.rejectWithdrawal(txId, body.reason);
  }

  @Post('users/:userId/credit')
  @ApiOperation({ summary: 'Credit user balance' })
  creditUser(@Request() req, @Param('userId') userId: string, @Body() body: { amount: number; note: string }) {
    this.checkAdmin(req);
    return this.adminService.creditUserBalance(userId, body.amount, body.note);
  }

  @Put('users/:userId/ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req);
    return this.adminService.banUser(userId);
  }

  @Put('users/:userId/kyc/approve')
  @ApiOperation({ summary: 'Approve KYC verification' })
  approveKYC(@Request() req, @Param('userId') userId: string) {
    this.checkAdmin(req);
    return this.adminService.approveKYC(userId);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast announcement to all users' })
  broadcast(@Request() req, @Body() body: { message: string; type: 'info' | 'warning' | 'promo' }) {
    this.checkAdmin(req);
    return this.adminService.broadcast(body.message, body.type);
  }
}
