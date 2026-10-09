import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { AccountDeletionService } from './account-deletion.service';
import { AccountService } from './account.service';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(
    private readonly account: AccountService,
    private readonly deletion: AccountDeletionService,
  ) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.account.summary(req.user.id);
  }

  /** Suggested reasons plus anything that must be sorted out before deleting. */
  @Get('deletion')
  deletionCheck(@Req() req: AuthenticatedRequest) {
    return this.deletion.check(req.user.id);
  }

  /** Closes the signed-in user's own account (password + typed confirmation). */
  @Post('delete')
  deleteAccount(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeleteAccountDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.deletion.deleteAccount(req.user.id, dto, {
      ipAddress: req.ip,
      userAgent,
    });
  }
}
