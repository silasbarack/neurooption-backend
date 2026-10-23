import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
@Injectable()
export class LeaderboardService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async getTopByPnl(limit = 50) { return this.userRepo.find({ where: { isActive: true }, order: { totalPnl: 'DESC' }, take: limit, select: ['id','name','country','totalTrades','winTrades','totalPnl'] }); }
  async getTopByWinRate(limit = 50) {
    const users = await this.userRepo.find({ where: { isActive: true }, take: 200, select: ['id','name','country','totalTrades','winTrades','totalPnl'] });
    return users.filter(u => u.totalTrades >= 10).map(u => ({ ...u, winRate: u.totalTrades ? (u.winTrades/u.totalTrades*100).toFixed(1) : '0' })).sort((a,b) => parseFloat(b.winRate)-parseFloat(a.winRate)).slice(0, limit);
  }
  async getUserRank(userId: string) { const u = await this.userRepo.findOne({ where: { id: userId } }); if (!u) return null; return { totalPnl: u.totalPnl, totalTrades: u.totalTrades, winRate: u.totalTrades ? (u.winTrades/u.totalTrades*100).toFixed(1) : '0' }; }
}
