import { Module } from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';

@Module({
  controllers: [LedgerController],
  providers: [LedgerService, PrismaService],
  // Exported so deposits/withdrawals/trading-engine can inject LedgerService
  // directly once they're wired to post real transactions instead of (or
  // alongside) their current EngineWallet/Wallet balance updates.
  exports: [LedgerService],
})
export class LedgerModule {}
