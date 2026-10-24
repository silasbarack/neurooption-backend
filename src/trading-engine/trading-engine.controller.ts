import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { TradingEngineService } from './trading-engine.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import {
  ACCOUNT_CURRENCIES,
  AccountCurrency,
  AccountType,
} from './trading-engine.types';

/** Visitors who are not signed in all share this demo account. */
export const GUEST_USER_ID = 'demo-user';

type MaybeAuthenticatedRequest = Request & { user?: { id: string } };

/**
 * Signed-in clients always act on their own account: any userId sent in the
 * query or body is ignored. Guests can only use the shared demo account.
 */
function resolveUserId(req: MaybeAuthenticatedRequest, accountType?: string) {
  const userId = req.user?.id;
  if (userId) return userId;

  if (accountType === 'QT Real') {
    throw new UnauthorizedException('Sign in to trade with your real account.');
  }

  return GUEST_USER_ID;
}

@Controller('trading-engine')
@UseGuards(OptionalJwtAuthGuard)
export class TradingEngineController {
  constructor(private readonly tradingEngineService: TradingEngineService) {}

  @Post('trades')
  placeTrade(@Req() req: MaybeAuthenticatedRequest, @Body() dto: PlaceTradeDto) {
    const userId = resolveUserId(req, dto.accountType);
    return this.tradingEngineService.placeTrade({ ...dto, userId });
  }

  @Post('trades/:tradeId/settle')
  settleTrade(@Req() req: MaybeAuthenticatedRequest, @Param('tradeId') tradeId: string) {
    return this.tradingEngineService.settleTradeForUser(tradeId, resolveUserId(req));
  }

  @Get('trades/open')
  getOpenTrades(@Req() req: MaybeAuthenticatedRequest) {
    return this.tradingEngineService.getOpenTrades(resolveUserId(req));
  }

  @Get('trades/history')
  getTradeHistory(@Req() req: MaybeAuthenticatedRequest) {
    return this.tradingEngineService.getTradeHistory(resolveUserId(req));
  }

  @Get('trades')
  getAllTrades(@Req() req: MaybeAuthenticatedRequest) {
    return this.tradingEngineService.getAllTrades(resolveUserId(req));
  }

  @Get('wallet')
  getWallet(
    @Req() req: MaybeAuthenticatedRequest,
    @Query('accountType') accountType: AccountType = 'QT Demo',
    @Query('currency') currency: AccountCurrency = 'USD',
  ) {
    const userId = resolveUserId(req, accountType);
    return this.tradingEngineService.getWallet(userId, accountType, currency);
  }

  @Post('demo/top-up')
  topUpDemo(
    @Req() req: MaybeAuthenticatedRequest,
    @Body('amount') amount: number,
    @Body('currency') currency: AccountCurrency = 'USD',
  ) {
    if (!ACCOUNT_CURRENCIES.includes(currency)) {
      throw new BadRequestException('Unsupported currency.');
    }
    const userId = resolveUserId(req, 'QT Demo');
    return this.tradingEngineService.topUpDemo(userId, Number(amount), currency);
  }

  @Get('transactions')
  getTransactions(@Req() req: MaybeAuthenticatedRequest) {
    return this.tradingEngineService.getTransactions(resolveUserId(req));
  }
}
