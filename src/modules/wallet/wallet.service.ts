import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus, PaymentMethod } from './transaction.entity';
import { UsersService } from '../users/users.service';
import Decimal from 'decimal.js';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  // ─── Deposit ────────────────────────────────────────────────────────────────

  async initiateDeposit(userId: string, dto: {
    amount: number;
    paymentMethod: PaymentMethod;
    currency?: string;
    cryptoCurrency?: string;
    cardToken?: string;
  }) {
    const user = await this.usersService.findById(userId);
    const amount = new Decimal(dto.amount);

    if (amount.lt(10)) throw new BadRequestException('Minimum deposit is $10');
    if (amount.gt(50000)) throw new BadRequestException('Maximum deposit is $50,000');

    const tx = this.txRepo.create({
      userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      amount: amount.toNumber(),
      currency: dto.currency || 'USD',
      cryptoCurrency: dto.cryptoCurrency,
      balanceBefore: user.balance,
    });

    const saved = await this.txRepo.save(tx);

    // Route to correct payment gateway
    switch (dto.paymentMethod) {
      case PaymentMethod.CARD:
        return this.processStripeDeposit(saved, dto.cardToken);
      case PaymentMethod.CRYPTO:
        return this.processCryptoDeposit(saved, dto.cryptoCurrency);
      case PaymentMethod.NOWPAYMENTS:
        return this.processNowPayments(saved, dto.cryptoCurrency);
      case PaymentMethod.SKRILL:
      case PaymentMethod.NETELLER:
      case PaymentMethod.PERFECT_MONEY:
      case PaymentMethod.BANK_WIRE:
        return this.processManualDeposit(saved);
      default:
        throw new BadRequestException('Unsupported payment method');
    }
  }

  private async processStripeDeposit(tx: Transaction, token?: string) {
    // Stripe integration — in production use stripe.paymentIntents.create()
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(tx.amount * 100),
    //   currency: 'usd',
    //   payment_method: token,
    //   confirm: true,
    // });
    // tx.externalId = paymentIntent.id;

    // Simulate successful payment for development
    await this.confirmDeposit(tx.id, `stripe_sim_${Date.now()}`);
    return { success: true, txId: tx.id, method: 'card', message: 'Deposit processed successfully' };
  }

  private async processCryptoDeposit(tx: Transaction, cryptoCurrency?: string) {
    // CoinPayments integration
    // Generate wallet address for the currency
    const walletAddresses = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf0',
      ETH: '0x742d35Cc6634C0532925a3b8D4C9E4b9d4b4E4E',
      USDT_TRC20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
      SOL: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      XRP: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      LTC: 'LM2WMpR1Rp6j3Sa59cMXMs1SPzj9eXpGc1',
    };

    const address = walletAddresses[cryptoCurrency] || walletAddresses['BTC'];
    tx.walletAddress = address;
    await this.txRepo.save(tx);

    return {
      success: true,
      txId: tx.id,
      method: 'crypto',
      cryptoCurrency,
      walletAddress: address,
      amount: tx.amount,
      message: `Send ${cryptoCurrency} to the address below. Deposit will be credited after 3 confirmations.`,
    };
  }

  private async processNowPayments(tx: Transaction, cryptoCurrency?: string) {
    // NowPayments API integration
    // const response = await fetch('https://api.nowpayments.io/v1/payment', {
    //   method: 'POST',
    //   headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY },
    //   body: JSON.stringify({ price_amount: tx.amount, price_currency: 'usd', pay_currency: cryptoCurrency }),
    // });
    return {
      success: true,
      txId: tx.id,
      method: 'nowpayments',
      paymentUrl: `https://nowpayments.io/payment/?iid=${tx.id}`,
      message: 'Redirecting to NowPayments...',
    };
  }

  private async processManualDeposit(tx: Transaction) {
    return {
      success: true,
      txId: tx.id,
      status: 'pending',
      message: 'Manual deposit initiated. Our team will process within 24 hours.',
    };
  }

  async confirmDeposit(txId: string, externalId?: string) {
    const tx = await this.txRepo.findOne({ where: { id: txId } });
    if (!tx) throw new NotFoundException('Transaction not found');

    const user = await this.usersService.findById(tx.userId);
    const newBalance = new Decimal(user.balance).plus(tx.amount).toNumber();

    tx.status = TransactionStatus.COMPLETED;
    tx.externalId = externalId;
    tx.balanceAfter = newBalance;
    await this.txRepo.save(tx);
    await this.usersService.update(tx.userId, { balance: newBalance });

    return tx;
  }

  // ─── Withdrawal ─────────────────────────────────────────────────────────────

  async requestWithdrawal(userId: string, dto: {
    amount: number;
    paymentMethod: PaymentMethod;
    walletAddress?: string;
    cryptoCurrency?: string;
    bankDetails?: any;
  }) {
    const user = await this.usersService.findById(userId);
    const amount = new Decimal(dto.amount);

    if (amount.lt(10)) throw new BadRequestException('Minimum withdrawal is $10');
    if (amount.gt(user.balance)) throw new BadRequestException('Insufficient balance');

    const fee = this.calculateWithdrawalFee(dto.paymentMethod, amount.toNumber());
    const netAmount = amount.minus(fee).toNumber();

    // Reserve funds
    await this.usersService.update(userId, { balance: new Decimal(user.balance).minus(amount).toNumber() });

    const tx = this.txRepo.create({
      userId,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      amount: amount.toNumber(),
      fee,
      currency: 'USD',
      cryptoCurrency: dto.cryptoCurrency,
      walletAddress: dto.walletAddress,
      balanceBefore: user.balance,
      balanceAfter: new Decimal(user.balance).minus(amount).toNumber(),
    });

    await this.txRepo.save(tx);

    return {
      success: true,
      txId: tx.id,
      amount: amount.toNumber(),
      fee,
      netAmount,
      message: 'Withdrawal request submitted. Processing within 1-3 business days.',
    };
  }

  private calculateWithdrawalFee(method: PaymentMethod, amount: number): number {
    const fees = {
      [PaymentMethod.CARD]: amount * 0.025,
      [PaymentMethod.CRYPTO]: 5,
      [PaymentMethod.NOWPAYMENTS]: 3,
      [PaymentMethod.SKRILL]: amount * 0.02,
      [PaymentMethod.NETELLER]: amount * 0.02,
      [PaymentMethod.PERFECT_MONEY]: amount * 0.015,
      [PaymentMethod.BANK_WIRE]: 25,
    };
    return fees[method] || 0;
  }

  // ─── History ─────────────────────────────────────────────────────────────────

  async getHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.txRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getBalance(userId: string) {
    const user = await this.usersService.findById(userId);
    return { balance: user.balance, demoBalance: user.demoBalance };
  }

  async getWalletStats(userId: string) {
    const deposits = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId AND tx.type = :type AND tx.status = :status', {
        userId, type: TransactionType.DEPOSIT, status: TransactionStatus.COMPLETED,
      })
      .getRawOne();

    const withdrawals = await this.txRepo
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where('tx.userId = :userId AND tx.type = :type AND tx.status = :status', {
        userId, type: TransactionType.WITHDRAWAL, status: TransactionStatus.COMPLETED,
      })
      .getRawOne();

    return {
      totalDeposited: parseFloat(deposits?.total || '0'),
      totalWithdrawn: parseFloat(withdrawals?.total || '0'),
    };
  }
}
