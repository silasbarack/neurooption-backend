import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountCurrency } from '@prisma/client';

import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfirmDepositDto } from './dto/confirm-deposit.dto';
import { MarkWithdrawalPaidDto } from './dto/mark-withdrawal-paid.dto';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { SettleTradeLostDto } from './dto/settle-trade-lost.dto';
import { SettleTradeWonDto } from './dto/settle-trade-won.dto';
import { LedgerService } from './ledger.service';
import { PROVIDER_CLEARING_ACCOUNT_CODE } from './ledger.types';

/**
 * All ledger entries are created exclusively by backend services
 * (deposits, withdrawals, the trading engine, or an admin adjustment flow)
 * calling LedgerService directly. This controller never lets a caller post
 * arbitrary debit/credit entries — every route maps to one specific,
 * pre-validated use case.
 */
@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /** A user may read their own balance; an ADMIN may read anyone's. */
  private assertCanReadUser(req: any, userId: string) {
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('You can only view your own ledger');
    }
  }

  @Get('balance/:userId')
  async getBalance(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('currency') currency: AccountCurrency = AccountCurrency.USD,
  ) {
    this.assertCanReadUser(req, userId);

    const balance = await this.ledgerService.getUserAvailableBalance(userId, currency);

    return {
      userId,
      currency,
      availableBalance: balance.toFixed(2),
    };
  }

  @Get('statement/:userId')
  async getStatement(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('currency') currency: AccountCurrency = AccountCurrency.USD,
  ) {
    this.assertCanReadUser(req, userId);

    const entries = await this.ledgerService.getUserStatement(userId, currency);

    return entries.map((entry) => ({
      id: entry.id,
      accountCode: entry.account.code,
      side: entry.side,
      amount: entry.amount.toFixed(2),
      currency: entry.currency,
      memo: entry.memo,
      transactionType: entry.transaction.type,
      transactionDescription: entry.transaction.description,
      createdAt: entry.createdAt,
    }));
  }

  // -------------------------------------------------------------------
  // DEV / ADMIN-ONLY TEST ENDPOINTS
  //
  // These exist purely so the ledger can be exercised end-to-end before
  // deposits.service.ts, withdrawals.service.ts, and trading-engine
  // .service.ts are wired to call LedgerService directly. They are gated
  // behind JwtAuthGuard + AdminGuard, but they are still a wider surface
  // than production should expose long-term.
  //
  // TODO before going live: delete this block (or keep it but restrict it
  // further, e.g. to a non-production environment check) once the real
  // deposit/withdrawal/trading-engine flows post to the ledger themselves.
  // -------------------------------------------------------------------

  @UseGuards(AdminGuard)
  @Post('dev/confirm-deposit')
  confirmDeposit(@Body() dto: ConfirmDepositDto) {
    return this.ledgerService.confirmDeposit({
      ...dto,
      clearingAccountCode: PROVIDER_CLEARING_ACCOUNT_CODE[dto.provider],
    });
  }

  @UseGuards(AdminGuard)
  @Post('dev/request-withdrawal')
  requestWithdrawal(@Body() dto: RequestWithdrawalDto) {
    return this.ledgerService.requestWithdrawal(dto);
  }

  @UseGuards(AdminGuard)
  @Post('dev/mark-withdrawal-paid')
  markWithdrawalPaid(@Body() dto: MarkWithdrawalPaidDto) {
    return this.ledgerService.markWithdrawalPaid({
      ...dto,
      clearingAccountCode: PROVIDER_CLEARING_ACCOUNT_CODE[dto.provider],
    });
  }

  @UseGuards(AdminGuard)
  @Post('dev/reject-withdrawal')
  rejectWithdrawal(@Body() dto: RejectWithdrawalDto) {
    return this.ledgerService.rejectWithdrawal(dto);
  }

  @UseGuards(AdminGuard)
  @Post('dev/place-trade')
  placeTrade(@Body() dto: PlaceTradeDto) {
    return this.ledgerService.placeTrade(dto);
  }

  @UseGuards(AdminGuard)
  @Post('dev/settle-trade-won')
  settleTradeWon(@Body() dto: SettleTradeWonDto) {
    return this.ledgerService.settleTradeWon(dto);
  }

  @UseGuards(AdminGuard)
  @Post('dev/settle-trade-lost')
  settleTradeLost(@Body() dto: SettleTradeLostDto) {
    return this.ledgerService.settleTradeLost(dto);
  }
}
