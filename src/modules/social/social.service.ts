import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TradingService } from '../trading/trading.service';

@Injectable()
export class SocialService {
  private copyRelationships: Map<string, Set<string>> = new Map(); // followerId → Set<traderId>
  private copySettings: Map<string, { amount: number; maxTrades: number }> = new Map(); // `${followerId}_${traderId}`

  constructor(
    private readonly usersService: UsersService,
    private readonly tradingService: TradingService,
  ) {}

  async getLeaderboard(sortBy: 'profit' | 'winRate' | 'trades' = 'profit', limit = 50) {
    const traders = await this.usersService.getLeaderboard(limit);
    return traders.map(t => ({
      ...t,
      winRate: t.totalTrades > 0
        ? ((t.winTrades / t.totalTrades) * 100).toFixed(1)
        : '0.0',
      followers: this.getFollowerCount(t.id),
    })).sort((a, b) => {
      if (sortBy === 'winRate') return parseFloat(b.winRate) - parseFloat(a.winRate);
      if (sortBy === 'trades') return b.totalTrades - a.totalTrades;
      return Number(b.totalPnl) - Number(a.totalPnl);
    });
  }

  private getFollowerCount(traderId: string): number {
    let count = 0;
    for (const followers of this.copyRelationships.values()) {
      if (followers.has(traderId)) count++;
    }
    return count;
  }

  async followTrader(followerId: string, traderId: string, settings: { amount: number; maxTrades?: number }) {
    if (followerId === traderId) throw new BadRequestException('Cannot follow yourself');

    const trader = await this.usersService.findById(traderId);
    if (!trader.isPublicTrader) throw new BadRequestException('Trader is not public');

    const following = this.copyRelationships.get(followerId) || new Set();
    if (following.size >= 10) throw new BadRequestException('Maximum 10 copy traders allowed');

    following.add(traderId);
    this.copyRelationships.set(followerId, following);
    this.copySettings.set(`${followerId}_${traderId}`, {
      amount: settings.amount,
      maxTrades: settings.maxTrades || 5,
    });

    return { success: true, message: `Now copying trades from ${trader.name}` };
  }

  async unfollowTrader(followerId: string, traderId: string) {
    const following = this.copyRelationships.get(followerId);
    if (following) {
      following.delete(traderId);
      this.copyRelationships.set(followerId, following);
    }
    this.copySettings.delete(`${followerId}_${traderId}`);
    return { success: true, message: 'Unfollowed trader' };
  }

  async getFollowing(followerId: string) {
    const following = this.copyRelationships.get(followerId) || new Set();
    const traders = await Promise.all(
      [...following].map(async traderId => {
        const profile = await this.usersService.getProfile(traderId);
        const settings = this.copySettings.get(`${followerId}_${traderId}`);
        return { ...profile, copySettings: settings };
      })
    );
    return traders;
  }

  async copytradeTrade(traderId: string, tradeData: any) {
    // Called when a public trader places a trade — propagate to all followers
    for (const [followerId, followedTraders] of this.copyRelationships.entries()) {
      if (!followedTraders.has(traderId)) continue;
      const settings = this.copySettings.get(`${followerId}_${traderId}`);
      if (!settings) continue;

      try {
        await this.tradingService.placeTrade(followerId, {
          ...tradeData,
          amount: settings.amount,
          copiedFromUserId: traderId,
        });
      } catch (err) {
        // Silently fail on copy trade errors (insufficient balance, etc.)
        console.warn(`Copy trade failed for follower ${followerId}:`, err.message);
      }
    }
  }

  async getPublicTraderProfile(traderId: string) {
    const profile = await this.usersService.getProfile(traderId);
    const stats = await this.usersService.getDashboardStats(traderId);
    const recentTrades = await this.tradingService.getTradeHistory(traderId, 1, 10);
    return {
      ...profile,
      stats,
      recentTrades: recentTrades.data,
      followers: this.getFollowerCount(traderId),
    };
  }

  async becomePublicTrader(userId: string, bio: string) {
    await this.usersService.update(userId, { isPublicTrader: true, bio });
    return { success: true, message: 'Your trading is now public. Others can copy your trades.' };
  }

  async stopPublicTrading(userId: string) {
    await this.usersService.update(userId, { isPublicTrader: false });
    return { success: true, message: 'Public trading disabled' };
  }
}
