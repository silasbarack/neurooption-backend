import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';

export async function serializableTransaction<T>(
  prisma: PrismaService,
  action: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(action, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 15000,
      });
    } catch (error) {
      if ((error as { code?: string })?.code !== 'P2034' || attempt >= 2) throw error;
    }
  }
}
