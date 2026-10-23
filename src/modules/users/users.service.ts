import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private mailService: MailService,
  ) {}

  /** Strips credentials and other secrets before a user is returned to a client. */
  static toPublic(user: User) {
    if (!user) return user;
    const { passwordHash, twoFactorSecret, resetCodeHash, resetCodeExpiresAt, resetCodeAttempts, ...safe } = user as any;
    return safe;
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }
  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async getProfile(id: string) {
    return UsersService.toPublic(await this.findById(id));
  }
  async update(userId: string, data: Partial<User>): Promise<void> {
    await this.repo.update(userId, data);
  }
  async updateBalance(userId: string, amount: number, isDemo = false): Promise<void> {
    const field = isDemo ? 'demoBalance' : 'balance';
    await this.repo.increment({ id: userId }, field, amount);
  }
  async updateLastLogin(userId: string): Promise<void> {
    await this.repo.update(userId, { lastLoginAt: new Date() });
  }
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.repo.update(userId, { passwordHash });
  }

  // ─── Password reset codes ────────────────────────────────────────────────────

  async setResetCode(userId: string, codeHash: string, expiresAt: Date): Promise<void> {
    await this.repo.update(userId, { resetCodeHash: codeHash, resetCodeExpiresAt: expiresAt, resetCodeAttempts: 0 });
  }
  async findWithResetCode(email: string): Promise<User | null> {
    return this.repo.createQueryBuilder('u')
      .addSelect(['u.resetCodeHash', 'u.resetCodeExpiresAt', 'u.resetCodeAttempts'])
      .where('u.email = :email', { email })
      .getOne();
  }
  async incrementResetAttempts(userId: string): Promise<void> {
    await this.repo.increment({ id: userId }, 'resetCodeAttempts', 1);
  }
  async clearResetCode(userId: string): Promise<void> {
    await this.repo.update(userId, { resetCodeHash: null, resetCodeExpiresAt: null, resetCodeAttempts: 0 });
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.findById(userId);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect password');
    const { email, name } = user;
    await this.repo.delete(userId);
    void this.mailService.sendAccountDeleted(email, name);
    return { message: 'Your account has been deleted.' };
  }
  async updateStats(userId: string, won: boolean, pnl: number): Promise<void> {
    await this.repo.increment({ id: userId }, 'totalTrades', 1);
    if (won) await this.repo.increment({ id: userId }, 'winTrades', 1);
    await this.repo.increment({ id: userId }, 'totalPnl', pnl);
  }
  async getLeaderboard(limit = 50) {
    const users = await this.repo.find({
      where: { isActive: true, isPublicTrader: true },
      order: { totalPnl: 'DESC' },
      take: limit,
    });
    return users.map(u => UsersService.toPublic(u));
  }
  async getDashboardStats(userId: string) {
    const u = await this.findById(userId);
    return {
      totalTrades: u.totalTrades,
      winTrades: u.winTrades,
      lossTrades: u.totalTrades - u.winTrades,
      winRate: u.totalTrades > 0 ? +((u.winTrades / u.totalTrades) * 100).toFixed(1) : 0,
      totalPnl: Number(u.totalPnl),
    };
  }
  async findAll(page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({ skip: (page-1)*limit, take: limit, order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }
}
