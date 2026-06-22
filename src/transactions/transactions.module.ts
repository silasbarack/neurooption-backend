import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TransactionsService } from './transactions.service';

@Module({
  providers: [TransactionsService, PrismaService],
  exports: [TransactionsService],
})
export class TransactionsModule {}