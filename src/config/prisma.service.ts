import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    const optionalDatabase = process.env.DATABASE_OPTIONAL === 'true';

    if (!databaseUrl && optionalDatabase) {
      this.logger.warn(
        'DATABASE_URL is not configured. Database-backed modules are disabled until PostgreSQL is attached.',
      );
      return;
    }

    await this.$connect();
    this.connected = true;
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }
}
