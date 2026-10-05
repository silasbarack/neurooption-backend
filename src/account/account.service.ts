import { createHash } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';
import { WalletsService } from '../wallets/wallets.service';

const REAL_CURRENCY = 'KES';

/** Short, stable, human-friendly account number, e.g. "N0458271". */
export function accountNumberFor(userId: string) {
  const digest = createHash('sha256').update(userId).digest();
  return `N${String(digest.readUInt32BE(0) % 10_000_000).padStart(7, '0')}`;
}

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallets: WalletsService,
  ) {}

  /** Everything the Account screen needs in one call. */
  async summary(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Account not found.');

    const [realWallet, demoWallet] = await Promise.all([
      this.prisma.wallet.findUnique({
        where: { userId_currency: { userId, currency: REAL_CURRENCY } },
      }),
      this.wallets.getBalance(userId, 'QT Demo', 'USD'),
    ]);

    const checklist = [
      { key: 'name', label: 'Full name', done: Boolean(user.fullName?.trim()) },
      { key: 'email', label: 'Email address', done: Boolean(user.email) },
      { key: 'phone', label: 'Phone number', done: Boolean(user.phone) },
      { key: 'kyc', label: 'Identity verification', done: user.kycStatus === 'APPROVED' },
    ];
    const completion = Math.round(
      (checklist.filter((item) => item.done).length / checklist.length) * 100,
    );

    return {
      id: user.id,
      accountNumber: accountNumberFor(user.id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      verified: user.kycStatus === 'APPROVED',
      memberSince: user.createdAt,
      profile: { completion, checklist },
      real: {
        currency: REAL_CURRENCY,
        balance: realWallet ? Number(realWallet.balance) : 0,
        locked: realWallet ? Number(realWallet.locked) : 0,
      },
      demo: { currency: 'USD', balance: demoWallet.balanceUsd },
    };
  }
}
