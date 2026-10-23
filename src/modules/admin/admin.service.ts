import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Trade } from '../trading/trade.entity';
import { Transaction } from '../wallet/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Trade) private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    private readonly walletService: WalletService,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  async getPlatformStats() {
    const [totalUsers, totalTrades, totalTx] = await Promise.all([
      this.userRepo.count(),
      this.tradeRepo.count(),
      this.txRepo.count(),
    ]);

    const volumeResult = await this.tradeRepo
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'volume')
      .getRawOne();

    const profitResult = await this.tradeRepo
      .createQueryBuilder('t')
      .select('SUM(t.profit)', 'profit')
      .where('t.status = :status', { status: 'won' })
      .getRawOne();

    const depositsResult = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.type = :type AND tx.status = :status', { type: 'deposit', status: 'completed' })
      .getRawOne();

    return {
      totalUsers,
      totalTrades,
      totalTransactions: totalTx,
      tradeVolume: parseFloat(volumeResult?.volume || '0'),
      totalPayouts: parseFloat(profitResult?.profit || '0'),
      totalDeposits: parseFloat(depositsResult?.total || '0'),
    };
  }

  async getAllUsers(page = 1, limit = 50) {
    const [items, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getPendingWithdrawals() {
    return this.txRepo.find({
      where: { type: 'withdrawal' as any, status: 'pending' as any },
      order: { createdAt: 'ASC' },
    });
  }

  async approveWithdrawal(txId: string) {
    await this.txRepo.update(txId, { status: 'completed' as any });
    return { success: true, message: 'Withdrawal approved' };
  }

  async rejectWithdrawal(txId: string, reason: string) {
    const tx = await this.txRepo.findOne({ where: { id: txId } });
    if (!tx) throw new Error('Transaction not found');

    // Refund the balance
    const user = await this.userRepo.findOne({ where: { id: tx.userId } });
    if (user) {
      await this.userRepo.update(tx.userId, { balance: user.balance + tx.amount });
    }
    await this.txRepo.update(txId, { status: 'failed' as any });
    return { success: true, message: 'Withdrawal rejected and funds refunded' };
  }

  async creditUserBalance(userId: string, amount: number, note: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    await this.userRepo.update(userId, { balance: user.balance + amount });
    await this.txRepo.save(this.txRepo.create({
      userId,
      type: 'bonus' as any,
      status: 'completed' as any,
      amount,
      currency: 'USD',
      balanceBefore: user.balance,
      balanceAfter: user.balance + amount,
    }));

    this.wsGateway.notifyBalanceUpdate(userId, user.balance + amount, user.demoBalance);
    return { success: true, message: `Credited $${amount} to user` };
  }

  async banUser(userId: string) {
    await this.userRepo.update(userId, { role: 'banned' as any });
    return { success: true, message: 'User banned' };
  }

  async approveKYC(userId: string) {
    await this.userRepo.update(userId, { kycStatus: 'verified' as any });
    return { success: true, message: 'KYC approved' };
  }

  async broadcast(message: string, type: 'info' | 'warning' | 'promo') {
    this.wsGateway.broadcastAnnouncement(message, type);
    return { success: true, message: 'Announcement sent to all connected users' };
  }
}
