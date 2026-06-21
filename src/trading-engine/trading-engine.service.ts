import { BadRequestException, Injectable } from '@nestjs/common';
import { MarketDataService } from '../market-data/market-data.service';
import {
  MARKET_ASSETS,
  TIMEFRAME_SECONDS,
} from '../market-data/market-data.constants';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TradesService } from '../trades/trades.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import {
  AccountCurrency,
  AccountType,
  PlacedTrade,
  TradeSide,
  TradeStatus,
  currencyToUsd,
} from './trading-engine.types';

@Injectable()
export class TradingEngineService {
  private readonly settlementTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly walletsService: WalletsService,
    private readonly transactionsService: TransactionsService,
    private readonly tradesService: TradesService,
  ) {}

  placeTrade(dto: PlaceTradeDto) {
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

    this.walletsService.debit(userId, accountType, stakeUsd);

    const trade: PlacedTrade = {
      id: this.createId('trade'),
      userId,
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
    };

    this.tradesService.create(trade);

    this.transactionsService.create({
      userId,
      accountType,
      tradeId: trade.id,
      type: 'TRADE_STAKE',
      amountUsd: Number((-stakeUsd).toFixed(8)),
      description: `${side} stake on ${asset.symbol}`,
    });

    this.scheduleSettlement(trade.id, expiryTime);

    return {
      trade,
      wallet: this.walletsService.getBalance(userId, accountType, currency),
    };
  }

  settleTrade(tradeId: string) {
    const trade = this.tradesService.findById(tradeId);

    if (!trade) {
      throw new BadRequestException('Trade not found.');
    }

    if (trade.status !== 'PENDING') {
      return {
        trade,
        wallet: this.walletsService.getBalance(
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

    const settlement = this.applySettlement(trade, status, closePrice);

    const updatedTrade = this.tradesService.update(trade.id, settlement);

    if (!updatedTrade) {
      throw new BadRequestException('Could not update trade.');
    }

    this.clearSettlementTimer(trade.id);

    return {
      trade: updatedTrade,
      wallet: this.walletsService.getBalance(
        updatedTrade.userId,
        updatedTrade.accountType,
        updatedTrade.currency,
      ),
    };
  }

  getOpenTrades(userId = 'demo-user') {
    return this.tradesService.findOpenByUser(userId);
  }

  getTradeHistory(userId = 'demo-user') {
    return this.tradesService.findHistoryByUser(userId);
  }

  getAllTrades(userId = 'demo-user') {
    return this.tradesService.findAllByUser(userId);
  }

  getWallet(
    userId = 'demo-user',
    accountType: AccountType = 'QT Demo',
    currency: AccountCurrency = 'USD',
  ) {
    return this.walletsService.getBalance(userId, accountType, currency);
  }

  getTransactions(userId = 'demo-user') {
    return this.transactionsService.findByUser(userId);
  }

  private applySettlement(
    trade: PlacedTrade,
    status: TradeStatus,
    closePrice: number,
  ): Partial<PlacedTrade> {
    const settledAt = Date.now();

    if (status === 'WON') {
      this.walletsService.credit(
        trade.userId,
        trade.accountType,
        trade.expectedReturnUsd,
      );

      this.transactionsService.create({
        userId: trade.userId,
        accountType: trade.accountType,
        tradeId: trade.id,
        type: 'TRADE_WIN_RETURN',
        amountUsd: Number(trade.expectedReturnUsd.toFixed(8)),
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
      this.walletsService.credit(trade.userId, trade.accountType, trade.stakeUsd);

      this.transactionsService.create({
        userId: trade.userId,
        accountType: trade.accountType,
        tradeId: trade.id,
        type: 'TRADE_DRAW_REFUND',
        amountUsd: Number(trade.stakeUsd.toFixed(8)),
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

    this.transactionsService.create({
      userId: trade.userId,
      accountType: trade.accountType,
      tradeId: trade.id,
      type: 'TRADE_LOSS',
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
      try {
        this.settleTrade(tradeId);
      } catch {
        // Keep server alive even if one settlement fails.
      }
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

  private createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}