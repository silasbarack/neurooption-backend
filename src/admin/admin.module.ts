import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from '../config/jwt.config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSessionGuard } from './admin-session.guard';
import { AdminSuperGuard } from './admin-super.guard';
import { TradingMonitorService } from './trading-monitor.service';

@Module({
  imports: [JwtModule.register({ secret: getJwtSecret() })],
  controllers: [AdminController],
  providers: [AdminService, AdminSessionGuard, AdminSuperGuard, TradingMonitorService],
})
export class AdminModule {}
