import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from '../config/jwt.config';
import { AdminSessionGuard } from './admin-session.guard';
import { AdminSuperGuard } from './admin-super.guard';

/** Lets other modules protect routes with AdminSessionGuard + AdminSuperGuard. */
@Module({
  imports: [JwtModule.register({ secret: getJwtSecret() })],
  providers: [AdminSessionGuard, AdminSuperGuard],
  exports: [JwtModule, AdminSessionGuard, AdminSuperGuard],
})
export class AdminAuthModule {}
