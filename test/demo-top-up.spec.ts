/// <reference types="jest" />
import { BadRequestException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { WalletsService } from '../src/wallets/wallets.service';

describe('demo top-up', () => {
  const prisma = new PrismaClient();
  const wallets = new WalletsService(
    prisma as unknown as ConstructorParameters<typeof WalletsService>[0],
  );
  const userId = `demo-top-up-test-${Date.now()}`;

  async function setDemoUsd(balanceUsd: number) {
    const wallet = await wallets.ensureWallet(userId, 'QT Demo', 'USD');
    await prisma.engineWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: new Prisma.Decimal(balanceUsd),
        balance: new Prisma.Decimal(balanceUsd),
      },
    });
  }

  afterAll(async () => {
    await prisma.engineWallet.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  it('refuses while the demo balance is $10,000 or more', async () => {
    await setDemoUsd(10_000);
    await expect(wallets.topUpDemo(userId, 50_000)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('adds the chosen amount once the balance is below $10,000', async () => {
    await setDemoUsd(4_250);
    const result = await wallets.topUpDemo(userId, 50_000, 'KES');
    const usd = await wallets.getBalance(userId, 'QT Demo', 'USD');

    expect(usd.balanceUsd).toBe(54_250);
    // Shown in the selected currency at the configured rate.
    expect(result.wallet.currency).toBe('KES');
    expect(result.wallet.balance).toBeCloseTo(54_250 * 129.5, 2);
  });

  it('cannot add twice from one low balance', async () => {
    await setDemoUsd(900);
    const attempts = await Promise.allSettled([
      wallets.topUpDemo(userId, 20_000),
      wallets.topUpDemo(userId, 20_000),
    ]);
    const usd = await wallets.getBalance(userId, 'QT Demo', 'USD');

    expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(1);
    expect(usd.balanceUsd).toBe(20_900);
  });

  it('only accepts the offered amounts', async () => {
    await setDemoUsd(100);
    await expect(wallets.topUpDemo(userId, 1_000_000)).rejects.toThrow(
      BadRequestException,
    );
  });
});
