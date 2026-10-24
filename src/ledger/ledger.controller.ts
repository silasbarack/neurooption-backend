import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountCurrency } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LedgerService } from './ledger.service';

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

}
