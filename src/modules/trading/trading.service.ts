import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Trade, TradeDirection, TradeStatus, TradeMode } from './trade.entity';
import { UsersService } from '../users/users.service';
import { MarketDataService } from '../market-data/market-data.service';
import { AuditService } from '../audit/audit.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(Trade) private tradeRepo: Repository<Trade>,
    private usersService: UsersService,
    private marketDataService: MarketDataService,
    private auditService: AuditService,
    private eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {}

  async placeTrade(userId: string, dto: CreateTradeDto): Promise<Trade> {
    const user = await this.usersService.findById(userId);
    const isDemo = dto.mode === TradeMode.DEMO;
    const currentBalance = isDemo ? user.demoBalance : user.balance;

    if (Number(currentBalance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }
    if (dto.amount < 1 || dto.amount > 10000) {
      throw new BadRequestException('Amount must be between $1 and $10,000');
    }

    const asset = await this.marketDataService.getAsset(dto.assetId);
    if (!asset) throw new NotFoundException('Asset not found');

    const currentPrice = await this.marketDataService.getCurrentPrice(dto.assetId);
    const expiresAt = new Date(Date.now() + dto.durationSeconds * 1000);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.usersService.updateBalance(userId, -dto.amount, isDemo);

      const trade = this.tradeRepo.create({
        userId, assetId: dto.assetId, assetName: asset.name,
        direction: dto.direction, amount: dto.amount,
        payout: asset.payout, openPrice: currentPrice,
        durationSeconds: dto.durationSeconds,
        mode: dto.mode || TradeMode.DEMO,
        expiresAt, signalId: dto.signalId,
      });
      const saved = await queryRunner.manager.save(trade);

      await this.auditService.log(userId, 'trade.placed', { tradeId: saved.id, amount: dto.amount, direction: dto.direction });
      await queryRunner.commitTransaction();

      this.scheduleSettlement(saved);
      this.eventEmitter.emit('trade.placed', { userId, trade: saved });
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private scheduleSettlement(trade: Trade): void {
    const delay = trade.expiresAt.getTime() - Date.now();
    setTimeout(() => this.settleTrade(trade.id), Math.max(0, delay));
  }

  async settleTrade(tradeId: string): Promise<Trade> {
    const trade = await this.tradeRepo.findOne({ where: { id: tradeId } });
    if (!trade || trade.status !== TradeStatus.OPEN) return trade;

    const closePrice = await this.marketDataService.getCurrentPrice(trade.assetId);
    const won = (trade.direction === TradeDirection.CALL && closePrice > trade.openPrice) ||
                (trade.direction === TradeDirection.PUT && closePrice < trade.openPrice);
    const tie = closePrice === Number(trade.openPrice);

    let status: TradeStatus;
    let profitLoss: number;

    if (tie) {
      status = TradeStatus.TIE;
      profitLoss = 0;
      await this.usersService.updateBalance(trade.userId, Number(trade.amount), trade.mode === TradeMode.DEMO);
    } else if (won) {
      status = TradeStatus.WIN;
      profitLoss = Number(trade.amount) * (Number(trade.payout) / 100);
      await this.usersService.updateBalance(trade.userId, Number(trade.amount) + profitLoss, trade.mode === TradeMode.DEMO);
    } else {
      status = TradeStatus.LOSS;
      profitLoss = -Number(trade.amount);
    }

    const updated = await this.tradeRepo.save({
      ...trade, status, closePrice, profitLoss, closedAt: new Date(),
    });

    if (trade.mode === TradeMode.REAL) {
      await this.usersService.updateStats(trade.userId, won, profitLoss);
    }

    this.eventEmitter.emit('trade.settled', { userId: trade.userId, trade: updated });
    await this.auditService.log(trade.userId, 'trade.settled', { tradeId, status, profitLoss });
    return updated;
  }

  async getOpenTrades(userId: string): Promise<Trade[]> {
    return this.tradeRepo.find({ where: { userId, status: TradeStatus.OPEN }, order: { createdAt: 'DESC' } });
  }

  async getTradeHistory(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.tradeRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getStats(userId: string) {
    const user = await this.usersService.findById(userId);
    const [allTrades] = await this.tradeRepo.findAndCount({ where: { userId } });
    const wins = allTrades.filter(t => t.status === TradeStatus.WIN).length;
    const losses = allTrades.filter(t => t.status === TradeStatus.LOSS).length;
    const totalPnl = allTrades.reduce((sum, t) => sum + Number(t.profitLoss), 0);
    return {
      totalTrades: allTrades.length, wins, losses,
      winRate: allTrades.length ? (wins / allTrades.length * 100).toFixed(1) : '0',
      totalPnl: totalPnl.toFixed(2),
      balance: user.balance, demoBalance: user.demoBalance,
    };
  }
}
