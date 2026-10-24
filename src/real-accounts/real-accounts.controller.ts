import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AccountCurrency } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { RealAccountsService } from './real-accounts.service';

@Controller('real-accounts')
@UseGuards(JwtAuthGuard)
export class RealAccountsController {
  constructor(private readonly service: RealAccountsService) {}

  private assertOwner(req: { user: { id: string } }, userId: string) {
    if (req.user.id !== userId) throw new ForbiddenException('You can only access your own account.');
  }

  @Post(':userId')
  create(@Req() req: { user: { id: string } }, @Param('userId') userId: string, @Body('currency') currency?: AccountCurrency) {
    this.assertOwner(req, userId);
    return this.service.create(userId, currency);
  }

  @Get('user/:userId')
  findByUser(@Req() req: { user: { id: string } }, @Param('userId') userId: string) {
    this.assertOwner(req, userId);
    return this.service.findByUser(userId);
  }

  @Patch('user/:userId/switch-currency')
  switchCurrency(@Req() req: { user: { id: string } }, @Param('userId') userId: string, @Body() dto: SwitchAccountCurrencyDto) {
    this.assertOwner(req, userId);
    return this.service.switchCurrency(userId, dto);
  }
}
