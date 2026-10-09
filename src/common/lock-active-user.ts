import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** Coordinate closure with financial activity, including serializable snapshots. */
export async function lockActiveUser(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  // Writing the row makes a deletion snapshot taken before a concurrent
  // deposit or commission conflict and retry against fresh balances.
  const changed = await tx.user.updateMany({
    where: { id: userId, deletedAt: null },
    data: { updatedAt: new Date() },
  });
  if (changed.count !== 1) throw new NotFoundException('User account not found.');
}
