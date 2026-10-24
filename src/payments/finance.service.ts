import { Injectable } from '@nestjs/common';
import {
  PaymentDirection,
  PaymentGatewayType,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { WithdrawalsService } from '../withdrawals/withdrawals.service';
import { MpesaService } from './mpesa.service';

const CURRENCY = 'KES';

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly withdrawalsService: WithdrawalsService,
    private readonly mpesa: MpesaService,
  ) {}

  /** The signed-in user's real-money wallet and deposit/withdrawal history. */
  async overview(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency: CURRENCY } },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: { in: [TransactionType.DEPOSIT, TransactionType.WITHDRAWAL] },
      },
      include: {
        deposit: { include: { gateway: { select: { type: true } } } },
        withdrawal: { include: { gateway: { select: { type: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      wallet: {
        currency: CURRENCY,
        balance: wallet ? Number(wallet.balance) : 0,
        locked: wallet ? Number(wallet.locked) : 0,
      },
      mpesa: this.mpesa.configSummary(),
      transactions: transactions.map((t) => {
        const payment = t.deposit ?? t.withdrawal;
        return {
          id: t.id,
          type: t.type === TransactionType.DEPOSIT ? 'Deposit' : 'Withdrawal',
          method: gatewayLabel(payment?.gateway?.type),
          amount: Number(t.amount),
          currency: payment?.currency ?? CURRENCY,
          status: t.status,
          phone: payment?.phone ? maskPhone(payment.phone) : null,
          reference: t.status === 'COMPLETED' ? payment?.externalRef ?? null : null,
          createdAt: t.createdAt,
        };
      }),
    };
  }

  async requestWithdrawal(userId: string, phone: string, amount: number) {
    const normalizedPhone = this.mpesa.normalizePhone(phone);

    const wallet = await this.prisma.wallet.upsert({
      where: { userId_currency: { userId, currency: CURRENCY } },
      update: {},
      create: { userId, currency: CURRENCY },
    });

    await this.prisma.paymentGateway.upsert({
      where: {
        type_direction: {
          type: PaymentGatewayType.MPESA,
          direction: PaymentDirection.OUT,
        },
      },
      update: {},
      create: {
        name: 'M-Pesa',
        type: PaymentGatewayType.MPESA,
        direction: PaymentDirection.OUT,
      },
    });

    const withdrawal = await this.withdrawalsService.create({
      userId,
      walletId: wallet.id,
      gatewayType: PaymentGatewayType.MPESA,
      amount: Math.round(Number(amount) * 100) / 100,
      currency: CURRENCY,
      phone: normalizedPhone,
    });

    return {
      id: withdrawal.id,
      status: withdrawal.status,
      amount: Number(withdrawal.amount),
      currency: CURRENCY,
      message: 'Withdrawal requested. It will be reviewed and paid to your M-Pesa.',
    };
  }
}

function gatewayLabel(type?: PaymentGatewayType): string {
  switch (type) {
    case PaymentGatewayType.MPESA:
      return 'M-Pesa';
    case PaymentGatewayType.AIRTEL_MONEY:
      return 'Airtel Money';
    case PaymentGatewayType.BINANCE_PAY:
      return 'Binance Pay';
    case PaymentGatewayType.TKASH:
      return 'T-Kash';
    case PaymentGatewayType.EQUITEL:
      return 'Equitel';
    default:
      return 'Manual';
  }
}

function maskPhone(phone: string): string {
  return phone.length > 6 ? `${phone.slice(0, 6)}***${phone.slice(-2)}` : phone;
}
