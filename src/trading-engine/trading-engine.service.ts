import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTradeDto, TradeDirection } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeStatus } from './dto/trade-result.dto';

@Injectable()
export class TradingEngineService {
  private trades: any[] = [];

  async createTrade(userId: string, dto: CreateTradeDto) {
    const entryPrice = await this.getCurrentPrice(dto.symbol);

    const trade = {
      id: crypto.randomUUID(),
      userId,
      symbol: dto.symbol,
      direction: dto.direction,
      amount: dto.amount,
      expiry: dto.expiry,
      timeframe: dto.timeframe,
      marketType: dto.marketType,
      entryPrice,
      status: TradeStatus.OPEN,
      createdAt: new Date(),
      expiresAt: this.calculateExpiry(dto.expiry),
    };

    this.trades.push(trade);
    return trade;
  }

  async settleTrade(dto: SettleTradeDto) {
    const trade = this.trades.find((t) => t.id === dto.tradeId);

    if (!trade) {
      throw new BadRequestException('Trade not found');
    }

    if (trade.status !== TradeStatus.OPEN) {
      throw new BadRequestException('Trade already settled');
    }

    let status: TradeStatus;

    if (dto.closePrice === trade.entryPrice) {
      status = TradeStatus.DRAW;
    } else if (
      trade.direction === TradeDirection.BUY &&
      dto.closePrice > trade.entryPrice
    ) {
      status = TradeStatus.WON;
    } else if (
      trade.direction === TradeDirection.SELL &&
      dto.closePrice < trade.entryPrice
    ) {
      status = TradeStatus.WON;
    } else {
      status = TradeStatus.LOST;
    }

    const payoutRate = 0.85;
    const profit =
      status === TradeStatus.WON
        ? trade.amount * payoutRate
        : status === TradeStatus.DRAW
          ? 0
          : -trade.amount;

    trade.status = status;
    trade.closePrice = dto.closePrice;
    trade.profit = profit;
    trade.payout = status === TradeStatus.WON ? trade.amount + profit : 0;
    trade.settledAt = new Date();

    return trade;
  }

  async getUserTrades(userId: string) {
    return this.trades.filter((trade) => trade.userId === userId);
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    return 100 + Math.random() * 10;
  }

  private calculateExpiry(expiry: string): Date {
    const [hours, minutes, seconds] = expiry.split(':').map(Number);

    if (
      hours < 0 ||
      hours > 5 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      throw new BadRequestException('Invalid expiry time');
    }

    const now = new Date();
    now.setHours(now.getHours() + hours);
    now.setMinutes(now.getMinutes() + minutes);
    now.setSeconds(now.getSeconds() + seconds);

    return now;
  }
}