import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType, PaymentStatus, PaymentMethod } from './payment.entity';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PaymentsService {
  private readonly MIN_DEPOSIT = 10;
  private readonly MIN_WITHDRAWAL = 10;
  private readonly MAX_DAILY_WITHDRAWAL = 50000;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private usersService: UsersService,
    private auditService: AuditService,
  ) {}

  async createDeposit(userId: string, amount: number, method: PaymentMethod, currency = 'USD'): Promise<Payment> {
    if (amount < this.MIN_DEPOSIT) throw new BadRequestException(`Minimum deposit is $${this.MIN_DEPOSIT}`);
    const payment = this.paymentRepo.create({ userId, type: PaymentType.DEPOSIT, method, amount, currency, status: PaymentStatus.PENDING });
    const saved = await this.paymentRepo.save(payment);
    await this.auditService.log(userId, 'payment.deposit.initiated', { paymentId: saved.id, amount, method });
    return saved;
  }

  async processDepositWebhook(paymentId: string, externalId: string, txHash?: string): Promise<void> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment || payment.status !== PaymentStatus.PENDING) return;
    await this.paymentRepo.update(paymentId, { status: PaymentStatus.COMPLETED, externalId, txHash, processedAt: new Date() });
    await this.usersService.updateBalance(payment.userId, Number(payment.amount));
    await this.auditService.log(payment.userId, 'payment.deposit.completed', { paymentId, amount: payment.amount });
  }

  async createWithdrawal(userId: string, amount: number, method: PaymentMethod, walletAddress?: string): Promise<Payment> {
    if (amount < this.MIN_WITHDRAWAL) throw new BadRequestException(`Minimum withdrawal is $${this.MIN_WITHDRAWAL}`);
    const user = await this.usersService.findById(userId);
    if (Number(user.balance) < amount) throw new BadRequestException('Insufficient balance');
    await this.usersService.updateBalance(userId, -amount);
    const payment = this.paymentRepo.create({ userId, type: PaymentType.WITHDRAWAL, method, amount, walletAddress, status: PaymentStatus.PROCESSING });
    const saved = await this.paymentRepo.save(payment);
    await this.auditService.log(userId, 'payment.withdrawal.initiated', { paymentId: saved.id, amount, method });
    return saved;
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.paymentRepo.findAndCount({
      where: { userId }, order: { createdAt: 'DESC' }, skip: (page-1)*limit, take: limit,
    });
    return { data, total, page, limit };
  }

  async getStripePaymentIntent(amount: number) {
    // Stripe integration: create PaymentIntent
    return { clientSecret: `pi_mock_${Date.now()}_secret_mock`, amount, currency: 'usd' };
  }

  async getCryptoDepositAddress(userId: string, currency: string) {
    const addresses: Record<string, string> = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', USDT: '0x742d35Cc6634C0532925a3b8D4C9C2F4',
      ETH: '0x742d35Cc6634C0532925a3b8D4C9C2F4', LTC: 'LdP8Qox1VAhCzLJNqrr74YovaWYyNBUWvL',
    };
    return { currency, address: addresses[currency] || 'mock_address', minAmount: 10, network: currency === 'USDT' ? 'TRC20' : currency };
  }
}
