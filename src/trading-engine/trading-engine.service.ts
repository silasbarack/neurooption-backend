import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountCurrency as LedgerCurrency } from '@prisma/client';
import { MarketDataService } from '../market-data/market-data.service';
import {
  MARKET_ASSETS,
  TIMEFRAME_SECONDS,
} from '../market-data/market-data.constants';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TradesService } from '../trades/trades.service';
import { LedgerService } from '../ledger/ledger.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import {
  AccountCurrency,
  AccountType,
  PlacedTrade,
  TradeSide,
  TradeStatus,
  currencyToUsd,
} from './trading-engine.types';

const LEDGER_CURRENCIES = new Set(Object.values(LedgerCurrency));

@Injectable()
export class TradingEngineService {
  private readonly settlementTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly tradesService: TradesService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Real-money trades (accountType === 'QT Real') must be backed by the
   * double-entry ledger, not just EngineWallet's balance column. Demo
   * trades never touch the ledger.
   *
   * Per explicit product decision: this throws rather than silently
   * skipping when the ledger rejects a real trade (e.g. because the
   * trading screen isn't yet sending a real, authenticated userId instead
   * of the "demo-user" placeholder). That's intentional — it surfaces the
   * gap loudly instead of letting real-money trades go untracked.
   */
  private assertLedgerCurrency(currency: AccountCurrency): LedgerCurrency {
    if (!LEDGER_CURRENCIES.has(currency as LedgerCurrency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported by the real-money ledger yet.`,
      );
    }

    return currency as LedgerCurrency;
  }

  async placeTrade(dto: PlaceTradeDto) {
    const userId = dto.userId?.trim() || 'demo-user';
    const assetSymbol = dto.asset.trim();
    const timeframe = (dto.timeframe || 'M1').toUpperCase();
    const side = dto.side;
    const accountType = (dto.accountType || 'QT Demo') as AccountType;
    const currency = (dto.currency || 'USD') as AccountCurrency;
    const amount = Number(dto.amount);
    const expirySeconds = Number(dto.expirySeconds);

    this.validateTradeInput({
      assetSymbol,
      timeframe,
      side,
      accountType,
      currency,
      amount,
      expirySeconds,
    });

    const asset = this.findAsset(assetSymbol);
    const entryTick = this.marketDataService.getTick(asset.symbol);
    const entryPrice = entryTick.price;

    const payoutPercent = this.calculatePayoutPercent(
      asset.payoutBoost,
      timeframe,
      expirySeconds,
    );

    const stakeUsd = currencyToUsd(amount, currency);
    const expectedProfitAmount = amount * (payoutPercent / 100);
    const expectedReturnAmount = amount + expectedProfitAmount;
    const expectedProfitUsd = currencyToUsd(expectedProfitAmount, currency);
    const expectedReturnUsd = currencyToUsd(expectedReturnAmount, currency);

    const entryTime = Date.now();
    const expiryTime = entryTime + expirySeconds * 1000;

    // Generated up front (rather than letting Prisma default it) so a
    // real-money ledger post can reference this trade's id before the
    // EngineTrade row itself exists.
    const tradeId = randomUUID();

    const ledgerCurrency =
      accountType === 'QT Real' ? this.assertLedgerCurrency(currency) : undefined;

    if (ledgerCurrency) {
      // Posted before any wallet/trade mutation: if this throws (e.g. the
      // userId doesn't match a real User row, or available balance is
      // insufficient per the ledger), nothing else about this trade has
      // happened yet.
      await this.ledgerService.placeTrade({
        userId,
        tradeId,
        stakeAmount: amount,
        currency: ledgerCurrency,
        idempotencyKey: `trade-placed-${tradeId}`,
      });
    }

    let wallet: Awaited<ReturnType<WalletsService['ensureWallet']>>;
    try {
      wallet = await this.walletsService.ensureWallet(userId, accountType, currency);
      await this.walletsService.debit(userId, accountType, stakeUsd);
    } catch (err) {
      if (ledgerCurrency) {
        // The ledger escrow above already committed in its own
        // transaction; since EngineWallet failed afterward, reverse it so
        // the ledger doesn't end up holding stake for a trade that was
        // never actually placed.
        await this.ledgerService.refundTrade({
          userId,
          tradeId,
          stakeAmount: amount,
          currency: ledgerCurrency,
          idempotencyKey: `trade-place-failed-${tradeId}`,
        });
      }
      throw err;
    }

    const trade = await this.tradesService.create({
      id: tradeId,
      userId,
      walletId: wallet.id,
      asset: asset.symbol,
      timeframe,
      side,
      accountType,
      currency,
      stakeAmount: Number(amount.toFixed(2)),
      stakeUsd: Number(stakeUsd.toFixed(8)),
      payoutPercent,
      expectedProfitAmount: Number(expectedProfitAmount.toFixed(2)),
      expectedProfitUsd: Number(expectedProfitUsd.toFixed(8)),
      expectedReturnAmount: Number(expectedReturnAmount.toFixed(2)),
      expectedReturnUsd: Number(expectedReturnUsd.toFixed(8)),
      entryPrice,
      entryTime,
      expirySeconds,
      expiryTime,
      status: 'PENDING',
      metadata: {
        source: 'BACKEND_OTC_ENGINE',
      },
    });

    await this.transactionsService.create({
      userId,
      walletId: wallet.id,
      accountType,
      currency,
      tradeId: trade.id,
      type: 'TRADE_STAKE',
      status: 'COMPLETED',
      amount: -amount,
      amountUsd: -stakeUsd,
      description: `${side} stake on ${asset.symbol}`,
    });

    this.scheduleSettlement(trade.id, expiryTime);

    return {
      trade,
      wallet: await this.walletsService.getBalance(userId, accountType, currency),
    };
  }

  async settleTrade(tradeId: string) {
    const trade = await this.tradesService.findById(tradeId);

    if (!trade) {
      throw new BadRequestException('Trade not found.');
    }

    if (trade.status !== 'PENDING') {
      return {
        trade,
        wallet: await this.walletsService.getBalance(
          trade.userId,
          trade.accountType,
          trade.currency,
        ),
      };
    }

    const closeTick = this.marketDataService.getTick(trade.asset);
    const closePrice = closeTick.price;

    const status = this.calculateResultStatus(
      trade.side,
      trade.entryPrice,
      closePrice,
    );

    const settlement = await this.applySettlement(trade, status, closePrice);
    const updatedTrade = await this.tradesService.update(trade.id, settlement);

    if (!updatedTrade) {
      throw new BadRequestException('Could not update trade.');
    }

    this.clearSettlementTimer(trade.id);

    return {
      trade: updatedTrade,
      wallet: await this.walletsService.getBalance(
        updatedTrade.userId,
        updatedTrade.accountType,
        updatedTrade.currency,
      ),
    };
  }

  async getOpenTrades(userId = 'demo-user') {
    await this.settleExpiredTrades(userId);
    return this.tradesService.findOpenByUser(userId);
  }

  async getTradeHistory(userId = 'demo-user') {
    await this.settleExpiredTrades(userId);
    return this.tradesService.findHistoryByUser(userId);
  }

  async getAllTrades(userId = 'demo-user') {
    await this.settleExpiredTrades(userId);
    return this.tradesService.findAllByUser(userId);
  }

  async getWallet(
    userId = 'demo-user',
    accountType: AccountType = 'QT Demo',
    currency: AccountCurrency = 'USD',
  ) {
    return this.walletsService.getBalance(userId, accountType, currency);
  }

  async getTransactions(userId = 'demo-user') {
    return this.transactionsService.findByUser(userId);
  }

  async settleExpiredTrades(userId = 'demo-user') {
    const openTrades = await this.tradesService.findOpenByUser(userId);
    const now = Date.now();

    const dueTrades = openTrades.filter((trade) => trade.expiryTime <= now);

    for (const trade of dueTrades) {
      await this.settleTrade(trade.id);
    }

    return {
      userId,
      settled: dueTrades.length,
    };
  }

  private async applySettlement(
    trade: PlacedTrade,
    status: TradeStatus,
    closePrice: number,
  ): Promise<Partial<PlacedTrade>> {
    const settledAt = Date.now();

    if (status === 'WON') {
      if (trade.accountType === 'QT Real') {
        await this.ledgerService.settleTradeWon({
          userId: trade.userId,
          tradeId: trade.id,
          stakeAmount: trade.stakeAmount,
          profitAmount: trade.expectedProfitAmount,
          currency: this.assertLedgerCurrency(trade.currency),
          idempotencyKey: `trade-settled-${trade.id}`,
        });
      }

      await this.walletsService.credit(
        trade.userId,
        trade.accountType,
        trade.expectedReturnUsd,
      );

      await this.transactionsService.create({
        userId: trade.userId,
        walletId: trade.walletId,
        accountType: trade.accountType,
        currency: trade.currency,
        tradeId: trade.id,
        type: 'TRADE_WIN_RETURN',
        status: 'COMPLETED',
        amount: trade.expectedReturnAmount,
        amountUsd: trade.expectedReturnUsd,
        description: `Winning return for ${trade.side} on ${trade.asset}`,
      });

      return {
        status,
        closePrice,
        settledAt,
        resultAmount: trade.expectedReturnAmount,
        resultUsd: trade.expectedReturnUsd,
        profitAmount: trade.expectedProfitAmount,
        profitUsd: trade.expectedProfitUsd,
      };
    }

    if (status === 'DRAW') {
      if (trade.accountType === 'QT Real') {
        await this.ledgerService.refundTrade({
          userId: trade.userId,
          tradeId: trade.id,
          stakeAmount: trade.stakeAmount,
          currency: this.assertLedgerCurrency(trade.currency),
          idempotencyKey: `trade-settled-${trade.id}`,
        });
      }

      await this.walletsService.credit(
        trade.userId,
        trade.accountType,
        trade.stakeUsd,
      );

      await this.transactionsService.create({
        userId: trade.userId,
        walletId: trade.walletId,
        accountType: trade.accountType,
        currency: trade.currency,
        tradeId: trade.id,
        type: 'TRADE_DRAW_REFUND',
        status: 'COMPLETED',
        amount: trade.stakeAmount,
        amountUsd: trade.stakeUsd,
        description: `Draw refund for ${trade.side} on ${trade.asset}`,
      });

      return {
        status,
        closePrice,
        settledAt,
        resultAmount: trade.stakeAmount,
        resultUsd: trade.stakeUsd,
        profitAmount: 0,
        profitUsd: 0,
      };
    }

    if (trade.accountType === 'QT Real') {
      await this.ledgerService.settleTradeLost({
        userId: trade.userId,
        tradeId: trade.id,
        stakeAmount: trade.stakeAmount,
        currency: this.assertLedgerCurrency(trade.currency),
        idempotencyKey: `trade-settled-${trade.id}`,
      });
    }

    await this.transactionsService.create({
      userId: trade.userId,
      walletId: trade.walletId,
      accountType: trade.accountType,
      currency: trade.currency,
      tradeId: trade.id,
      type: 'TRADE_LOSS',
      status: 'COMPLETED',
      amount: 0,
      amountUsd: 0,
      description: `Lost ${trade.side} trade on ${trade.asset}`,
    });

    return {
      status: 'LOST',
      closePrice,
      settledAt,
      resultAmount: 0,
      resultUsd: 0,
      profitAmount: -trade.stakeAmount,
      profitUsd: -trade.stakeUsd,
    };
  }

  private calculateResultStatus(
    side: TradeSide,
    entryPrice: number,
    closePrice: number,
  ): TradeStatus {
    if (closePrice === entryPrice) return 'DRAW';

    if (side === 'BUY') {
      return closePrice > entryPrice ? 'WON' : 'LOST';
    }

    return closePrice < entryPrice ? 'WON' : 'LOST';
  }

  private calculatePayoutPercent(
    payoutBoost: number,
    timeframe: string,
    expirySeconds: number,
  ) {
    const timeframeSeconds = TIMEFRAME_SECONDS[timeframe] ?? 60;

    let base = 84 + payoutBoost;

    if (timeframeSeconds <= 15) base -= 3;
    else if (timeframeSeconds <= 30) base -= 2;
    else if (timeframeSeconds <= 60) base -= 1;
    else if (timeframeSeconds >= 900) base += 1;

    if (expirySeconds <= 15) base -= 3;
    else if (expirySeconds <= 30) base -= 2;
    else if (expirySeconds >= 300) base += 1;

    return Math.min(Math.max(Math.round(base), 20), 92);
  }

  private scheduleSettlement(tradeId: string, expiryTime: number) {
    this.clearSettlementTimer(tradeId);

    const delayMs = Math.max(expiryTime - Date.now(), 0);

    const timer = setTimeout(() => {
      this.settleTrade(tradeId).catch(() => undefined);
    }, delayMs);

    timer.unref?.();
    this.settlementTimers.set(tradeId, timer);
  }

  private clearSettlementTimer(tradeId: string) {
    const timer = this.settlementTimers.get(tradeId);

    if (timer) {
      clearTimeout(timer);
      this.settlementTimers.delete(tradeId);
    }
  }

  private validateTradeInput(input: {
    assetSymbol: string;
    timeframe: string;
    side: TradeSide;
    accountType: AccountType;
    currency: AccountCurrency;
    amount: number;
    expirySeconds: number;
  }) {
    if (!input.assetSymbol) {
      throw new BadRequestException('Asset is required.');
    }

    if (!TIMEFRAME_SECONDS[input.timeframe]) {
      throw new BadRequestException(`Unsupported timeframe: ${input.timeframe}`);
    }

    if (!['BUY', 'SELL'].includes(input.side)) {
      throw new BadRequestException('Trade side must be BUY or SELL.');
    }

    if (!['QT Demo', 'QT Real'].includes(input.accountType)) {
      throw new BadRequestException('Invalid account type.');
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException('Trade amount must be greater than zero.');
    }

    if (
      !Number.isFinite(input.expirySeconds) ||
      input.expirySeconds < 5 ||
      input.expirySeconds > 18000
    ) {
      throw new BadRequestException('Expiry must be between 5 seconds and 5 hours.');
    }
  }

  private findAsset(symbol: string) {
    const normalized = symbol.trim().toLowerCase();

    const asset = MARKET_ASSETS.find(
      (item) => item.symbol.toLowerCase() === normalized,
    );

    if (!asset || !asset.isActive) {
      throw new BadRequestException(`Unsupported or inactive asset: ${symbol}`);
    }

    return asset;
  }
}