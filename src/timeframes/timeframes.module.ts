import { Module } from '@nestjs/common';

import { AdminAuthModule } from '../admin/admin-auth.module';
import { TimeframesController } from './timeframes.controller';
import { TimeframesService } from './timeframes.service';

@Module({
  imports: [AdminAuthModule],
  controllers: [TimeframesController],
  providers: [TimeframesService],
  exports: [TimeframesService],
})
export class TimeframesModule {}