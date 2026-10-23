import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from './payment.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('deposit') deposit(@Request() req, @Body() body: any) { return this.paymentsService.createDeposit(req.user.id, body.amount, body.method, body.currency); }
  @Post('withdraw') withdraw(@Request() req, @Body() body: any) { return this.paymentsService.createWithdrawal(req.user.id, body.amount, body.method, body.walletAddress); }
  @Get('history') history(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) { return this.paymentsService.getPaymentHistory(req.user.id, +page, +limit); }
  @Get('stripe/intent') stripeIntent(@Query('amount') amount: number) { return this.paymentsService.getStripePaymentIntent(+amount); }
  @Get('crypto/address/:currency') cryptoAddress(@Request() req, @Param('currency') currency: string) { return this.paymentsService.getCryptoDepositAddress(req.user.id, currency); }
}
