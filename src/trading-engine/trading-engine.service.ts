import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { MarketDataService } from '../market-data/market-data.service';

type AccountTypeValue = 'QT_DEMO' | 'QT_REAL';
type TradeSideValue = 'BUY' | 'SELL';
type TradeStatusValue = 'OPEN' | 'WON' | 'LOST' | 'DRAW' | 'CANCELLED' | 'EXPIRED';
type TransactionTypeValue =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'TRADE_STAKE'
  | 'TRADE_WIN'
  | 'TRADE_LOSS'
  | 'BONUS'
  | 'ADJUSTMENT'
  | 'REFUND';
type TransactionStatusValue =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

type AccountCurrencyValue =
  | 'USD'
  | 'KES'
  | 'UGX'
  | 'TZS'
  | 'NGN'
  | 'XOF'
  | 'EUR'
  | 'CAD'
  | 'JPY'
  | 'CNY'
  | 'AOA'
  | 'ZAR'
  | 'BRL';

type OpenTradeDto = {
  userId?: string;
  assetSymbol: string;
  assetLabel?: string;
  timeframe?: string;
  side: TradeSideValue;
  accountType: AccountTypeValue | 'QT Demo' | 'QT Real';
  currency: AccountCurrencyValue;
  stake: number;
  payout: number;
  expirySeconds: number;
};

type GetTradesDto = {
  userId?: string;
  accountType?: AccountTypeValue | 'QT Demo' | 'QT Real';
  currency?: AccountCurrencyValue;
  limit?: string;
};

const ACCOUNT_TYPES = {
  QT_DEMO: 'QT_DEMO' as AccountTypeValue,
  QT_REAL: 'QT_REAL' as AccountTypeValue,
};

const TRADE_SIDES = {
  BUY: 'BUY' as TradeSideValue,
  SELL: 'SELL' as TradeSideValue,
};

const TRADE_STATUSES = {
  OPEN: 'OPEN' as TradeStatusValue,
  WON: 'WON' as TradeStatusValue,
  LOST: 'LOST' as TradeStatusValue,
  DRAW: 'DRAW' as TradeStatusValue,
  CANCELLED: 'CANCELLED' as TradeStatusValue,
  EXPIRED: 'EXPIRED' as TradeStatusValue,
};

const TRANSACTION_TYPES = {
  TRADE_STAKE: 'TRADE_STAKE' as TransactionTypeValue,
  TRADE_WIN: 'TRADE_WIN' as TransactionTypeValue,
  TRADE_LOSS: 'TRADE_LOSS' as TransactionTypeValue,
  REFUND: 'REFUND' as TransactionTypeValue,
};

const TRANSACTION_STATUSES = {
  COMPLETED: 'COMPLETED' as TransactionStatusValue,
};

const MIN_EXPIRY_SECONDS = 5;
const MAX_EXPIRY_SECONDS = 5 * 60 * 60;
const DEMO_INITIAL_BALANCE_USD = 70000;

const EXCHANGE_RATES: Record<AccountCurrencyValue, number> = {
  USD: 1,
  KES: 129,
  UGX: 3720,
  TZS: 2550,
  NGN: 1510,
  XOF: 604,
  EUR: 0.92,
  CAD: 1.36,
  JPY: 157,
  CNY: 7.24,
  AOA: 865,
  ZAR: 18.2,
  BRL: 5.42,
};

@Injectable()
export class TradingEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketDataService: MarketDataService,
  ) {}

  async getWallet(query: GetTradesDto) {
    const userId = await this.resolveUserId(query.userId);
    const accountType = this.normalizeAccountType(query.accountType || 'QT_DEMO');
    const currency = this.normalizeCurrency(query.currency || 'USD');

    const wallet = await this.ensureWallet(userId, accountType, currency);

    return {
      userId,
      wallet: this.formatWallet(wallet),
    };
  }

  async openTrade(dto: OpenTradeDto) {
    const userId = await this.resolveUserId(dto.userId);
    const accountType = this.normalizeAccountType(dto.accountType);
    const currency = this.normalizeCurrency(dto.currency);
    const side = this.normalizeSide(dto.side);
    const timeframe = dto.timeframe || 'M1';

    const stake = Number(dto.stake);
    const payout = Number(dto.payout);
    const expirySeconds = this.clampExpiry(Number(dto.expirySeconds));

    if (!dto.assetSymbol) {
      throw new BadRequestException('assetSymbol is required.');
    }

    if (!Number.isFinite(stake) || stake <= 0) {
      throw new BadRequestException('Stake must be greater than 0.');
    }

    if (!Number.isFinite(payout) || payout < 20 || payout > 92) {
      throw new BadRequestException('Payout must be between 20 and 92.');
    }

    const exchangeRate = EXCHANGE_RATES[currency];
    const stakeUsd = stake / exchangeRate;
    const expectedProfit = stake * (payout / 100);
    const expectedReturn = stake + expectedProfit;

    const entryPrice = await this.getLatestBackendPrice(dto.assetSymbol, timeframe);

    const openedAt = new Date();
    const expiresAt = new Date(openedAt.getTime() + expirySeconds * 1000);

    const result = await (this.prisma as any).$transaction(async (tx: any) => {
      const wallet = await this.ensureWalletTx(tx, userId, accountType, currency);
      const walletBalanceUsd = Number(wallet.balanceUsd);

      if (walletBalanceUsd < stakeUsd) {
        throw new BadRequestException('Insufficient wallet balance.');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: (Number(wallet.balance) - stake).toString(),
          balanceUsd: (walletBalanceUsd - stakeUsd).toString(),
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: TRANSACTION_TYPES.TRADE_STAKE,
          status: TRANSACTION_STATUSES.COMPLETED,
          accountType,
          currency,
          amount: stake.toString(),
          amountUsd: stakeUsd.toString(),
          description: `Trade stake for ${dto.assetSymbol}`,
          metadata: {
            assetSymbol: dto.assetSymbol,
            side,
            payout,
            expirySeconds,
            entryPrice,
          },
        },
      });

      const trade = await tx.trade.create({
        data: {
          userId,
          walletId: wallet.id,
          assetSymbol: dto.assetSymbol,
          assetLabel: dto.assetLabel || dto.assetSymbol,
          timeframe,
          side,
          status: TRADE_STATUSES.OPEN,
          accountType,
          currency,
          stake: stake.toString(),
          stakeUsd: stakeUsd.toString(),
          payout: payout.toString(),
          expectedProfit: expectedProfit.toString(),
          expectedReturn: expectedReturn.toString(),
          entryPrice: entryPrice.toString(),
          openedAt,
          expiresAt,
          metadata: {
            source: 'BACKEND_OTC',
            expirySeconds,
          },
        },
      });

      return {
        trade,
        wallet: updatedWallet,
      };
    });

    return {
      message: 'Trade opened successfully.',
      userId,
      trade: this.formatTrade(result.trade),
      wallet: this.formatWallet(result.wallet),
    };
  }

  async getOpenTrades(query: GetTradesDto) {
    const userId = await this.resolveUserId(query.userId);

    await this.settleExpiredTrades(userId);

    const trades = await (this.prisma as any).trade.findMany({
      where: {
        userId,
        status: TRADE_STATUSES.OPEN,
      },
      orderBy: { openedAt: 'desc' },
      take: this.parseLimit(query.limit),
    });

    return {
      userId,
      trades: trades.map((trade: any) => this.formatTrade(trade)),
    };
  }

  async getTradeHistory(query: GetTradesDto) {
    const userId = await this.resolveUserId(query.userId);

    await this.settleExpiredTrades(userId);

    const trades = await (this.prisma as any).trade.findMany({
      where: {
        userId,
        status: {
          not: TRADE_STATUSES.OPEN,
        },
      },
      orderBy: { openedAt: 'desc' },
      take: this.parseLimit(query.limit),
    });

    return {
      userId,
      trades: trades.map((trade: any) => this.formatTrade(trade)),
    };
  }

  async settleExpiredTrades(userId?: string) {
    const now = new Date();

    const openTrades = await (this.prisma as any).trade.findMany({
      where: {
        status: TRADE_STATUSES.OPEN,
        expiresAt: {
          lte: now,
        },
        ...(userId ? { userId } : {}),
      },
      orderBy: { expiresAt: 'asc' },
      take: 200,
    });

    const settled = [];

    for (const trade of openTrades) {
      const result = await this.settleSingleTrade(trade.id);
      settled.push(result);
    }

    return {
      settledCount: settled.length,
      settled,
    };
  }

  private async settleSingleTrade(tradeId: string) {
    const trade = await (this.prisma as any).trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found.');
    }

    if (trade.status !== TRADE_STATUSES.OPEN) {
      return {
        trade: this.formatTrade(trade),
      };
    }

    await this.marketDataService.getCandles({
      asset: trade.assetSymbol,
      timeframe: trade.timeframe,
      limit: '5',
    });

    const expiryCandle = await (this.prisma as any).otcCandle.findFirst({
      where: {
        assetSymbol: trade.assetSymbol,
        timeframe: trade.timeframe,
        openTime: {
          lte: trade.expiresAt,
        },
      },
      orderBy: {
        openTime: 'desc',
      },
    });

    const closePrice = expiryCandle
      ? Number(expiryCandle.close)
      : await this.getLatestBackendPrice(trade.assetSymbol, trade.timeframe);

    const entryPrice = Number(trade.entryPrice);
    const side = trade.side as TradeSideValue;

    let status: TradeStatusValue = TRADE_STATUSES.LOST;

    if (closePrice === entryPrice) {
      status = TRADE_STATUSES.DRAW;
    } else if (side === TRADE_SIDES.BUY && closePrice > entryPrice) {
      status = TRADE_STATUSES.WON;
    } else if (side === TRADE_SIDES.SELL && closePrice < entryPrice) {
      status = TRADE_STATUSES.WON;
    }

    const exchangeRate = EXCHANGE_RATES[trade.currency as AccountCurrencyValue];

    const stake = Number(trade.stake);
    const stakeUsd = Number(trade.stakeUsd);
    const expectedReturn = Number(trade.expectedReturn);
    const expectedReturnUsd = expectedReturn / exchangeRate;

    const result = await (this.prisma as any).$transaction(async (tx: any) => {
      const wallet = trade.walletId
        ? await tx.wallet.findUnique({ where: { id: trade.walletId } })
        : null;

      if (!wallet) {
        throw new BadRequestException('Trade wallet was not found.');
      }

      let returnAmount = 0;
      let returnAmountUsd = 0;
      let profitAmount = 0;
      let transactionType: TransactionTypeValue = TRANSACTION_TYPES.TRADE_LOSS;

      if (status === TRADE_STATUSES.WON) {
        returnAmount = expectedReturn;
        returnAmountUsd = expectedReturnUsd;
        profitAmount = Number(trade.expectedProfit);
        transactionType = TRANSACTION_TYPES.TRADE_WIN;
      }

      if (status === TRADE_STATUSES.DRAW) {
        returnAmount = stake;
        returnAmountUsd = stakeUsd;
        profitAmount = 0;
        transactionType = TRANSACTION_TYPES.REFUND;
      }

      let updatedWallet = wallet;

      if (returnAmount > 0) {
        updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: (Number(wallet.balance) + returnAmount).toString(),
            balanceUsd: (Number(wallet.balanceUsd) + returnAmountUsd).toString(),
          },
        });
      }

      const updatedTrade = await tx.trade.update({
        where: { id: trade.id },
        data: {
          status,
          closePrice: closePrice.toString(),
          closedAt: new Date(),
          profitAmount: profitAmount.toString(),
          returnAmount: returnAmount.toString(),
          metadata: this.mergeMetadata(trade.metadata, {
            settlementSource: 'BACKEND_OTC',
            settledAt: new Date().toISOString(),
          }),
        },
      });

      await tx.transaction.create({
        data: {
          userId: trade.userId,
          walletId: wallet.id,
          type: transactionType,
          status: TRANSACTION_STATUSES.COMPLETED,
          accountType: trade.accountType,
          currency: trade.currency,
          amount: returnAmount.toString(),
          amountUsd: returnAmountUsd.toString(),
          description: `Trade ${status.toLowerCase()} for ${trade.assetSymbol}`,
          metadata: {
            tradeId: trade.id,
            assetSymbol: trade.assetSymbol,
            side: trade.side,
            entryPrice,
            closePrice,
            result: status,
          },
        },
      });

      return {
        trade: updatedTrade,
        wallet: updatedWallet,
      };
    });

    return {
      trade: this.formatTrade(result.trade),
      wallet: this.formatWallet(result.wallet),
    };
  }

  private async getLatestBackendPrice(assetSymbol: string, timeframe: string) {
    const candleResponse = await this.marketDataService.getCandles({
      asset: assetSymbol,
      timeframe,
      limit: '3',
    });

    const latest = candleResponse.candles[candleResponse.candles.length - 1];

    if (!latest) {
      throw new BadRequestException('No backend candle price available.');
    }

    return Number(latest.close);
  }

  private async resolveUserId(userId?: string) {
    if (userId) {
      const existingUser = await (this.prisma as any).user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found.');
      }

      return existingUser.id;
    }

    const demoUser = await (this.prisma as any).user.upsert({
      where: { email: 'demo@neurooption.local' },
      update: {},
      create: {
        email: 'demo@neurooption.local',
        fullName: 'NeuroOption Demo User',
      },
    });

    return demoUser.id;
  }

  private async ensureWallet(
    userId: string,
    accountType: AccountTypeValue,
    currency: AccountCurrencyValue,
  ) {
    return this.ensureWalletTx(this.prisma as any, userId, accountType, currency);
  }

  private async ensureWalletTx(
    tx: any,
    userId: string,
    accountType: AccountTypeValue,
    currency: AccountCurrencyValue,
  ) {
    const existingWallet = await tx.wallet.findUnique({
      where: {
        userId_accountType_currency: {
          userId,
          accountType,
          currency,
        },
      },
    });

    if (existingWallet) {
      return existingWallet;
    }

    const exchangeRate = EXCHANGE_RATES[currency];

    const initialBalanceUsd =
      accountType === ACCOUNT_TYPES.QT_DEMO ? DEMO_INITIAL_BALANCE_USD : 0;

    const initialBalance = initialBalanceUsd * exchangeRate;

    return tx.wallet.create({
      data: {
        userId,
        accountType,
        currency,
        balance: initialBalance.toString(),
        balanceUsd: initialBalanceUsd.toString(),
      },
    });
  }

  private normalizeAccountType(value: string): AccountTypeValue {
    if (value === 'QT_REAL' || value === 'QT Real') {
      return ACCOUNT_TYPES.QT_REAL;
    }

    return ACCOUNT_TYPES.QT_DEMO;
  }

  private normalizeCurrency(value: string): AccountCurrencyValue {
    const currencies = Object.keys(EXCHANGE_RATES);

    if (!currencies.includes(value)) {
      throw new BadRequestException(`Unsupported currency: ${value}`);
    }

    return value as AccountCurrencyValue;
  }

  private normalizeSide(value: string): TradeSideValue {
    if (value === TRADE_SIDES.SELL) return TRADE_SIDES.SELL;
    if (value === TRADE_SIDES.BUY) return TRADE_SIDES.BUY;

    throw new BadRequestException('Trade side must be BUY or SELL.');
  }

  private clampExpiry(value: number) {
    if (!Number.isFinite(value)) return 45;

    return Math.min(
      Math.max(Math.floor(value), MIN_EXPIRY_SECONDS),
      MAX_EXPIRY_SECONDS,
    );
  }

  private parseLimit(value?: string) {
    const parsed = Number(value || 50);

    if (!Number.isFinite(parsed)) return 50;

    return Math.min(Math.max(Math.floor(parsed), 1), 200);
  }

  private mergeMetadata(existing: unknown, next: Record<string, unknown>) {
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      return {
        ...(existing as Record<string, unknown>),
        ...next,
      };
    }

    return next;
  }

  private formatWallet(wallet: any) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      accountType: wallet.accountType,
      currency: wallet.currency,
      balance: Number(wallet.balance),
      balanceUsd: Number(wallet.balanceUsd),
      isActive: wallet.isActive,
      createdAt: wallet.createdAt?.toISOString?.() ?? wallet.createdAt,
      updatedAt: wallet.updatedAt?.toISOString?.() ?? wallet.updatedAt,
    };
  }

  private formatTrade(trade: any) {
    return {
      id: trade.id,
      userId: trade.userId,
      walletId: trade.walletId,
      assetSymbol: trade.assetSymbol,
      assetLabel: trade.assetLabel,
      timeframe: trade.timeframe,
      side: trade.side,
      status: trade.status,
      accountType: trade.accountType,
      currency: trade.currency,
      stake: Number(trade.stake),
      stakeUsd: Number(trade.stakeUsd),
      payout: Number(trade.payout),
      expectedProfit: Number(trade.expectedProfit),
      expectedReturn: Number(trade.expectedReturn),
      entryPrice: Number(trade.entryPrice),
      closePrice: trade.closePrice ? Number(trade.closePrice) : null,
      openedAt: trade.openedAt?.toISOString?.() ?? trade.openedAt,
      expiresAt: trade.expiresAt?.toISOString?.() ?? trade.expiresAt,
      closedAt: trade.closedAt?.toISOString?.() ?? null,
      profitAmount: trade.profitAmount ? Number(trade.profitAmount) : null,
      returnAmount: trade.returnAmount ? Number(trade.returnAmount) : null,
      metadata: trade.metadata,
    };
  }
}