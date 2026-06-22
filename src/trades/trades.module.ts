import { Module } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TradesService } from './trades.service';

@Module({
  providers: [TradesService, PrismaService],
  exports: [TradesService],
})
export class TradesModule {}