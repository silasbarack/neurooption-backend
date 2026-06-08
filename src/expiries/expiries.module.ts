import { Module } from '@nestjs/common';
import { ExpiriesController } from './expiries.controller';
import { ExpiriesService } from './expiries.service';

@Module({
  controllers: [ExpiriesController],
  providers: [ExpiriesService],
  exports: [ExpiriesService],
})
export class ExpiriesModule {}