import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { AccountService } from './account.service';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.account.summary(req.user.id);
  }
}
