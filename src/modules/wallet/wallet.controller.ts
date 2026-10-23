import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current balance' })
  getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get wallet statistics' })
  getStats(@Request() req) {
    return this.walletService.getWalletStats(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  getHistory(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getHistory(req.user.id, +page, +limit);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Initiate a deposit' })
  deposit(@Request() req, @Body() dto: any) {
    return this.walletService.initiateDeposit(req.user.id, dto);
  }

  @Post('deposit/:txId/confirm')
  @ApiOperation({ summary: 'Confirm a deposit (webhook/admin)' })
  confirmDeposit(@Param('txId') txId: string, @Body() body: { externalId?: string }) {
    return this.walletService.confirmDeposit(txId, body.externalId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request a withdrawal' })
  withdraw(@Request() req, @Body() dto: any) {
    return this.walletService.requestWithdrawal(req.user.id, dto);
  }
}
