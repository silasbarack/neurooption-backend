import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EmailsModule } from '../emails/emails.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    EmailsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy was previously defined but never registered, so
  // AuthGuard('jwt') had nothing to validate against. Registering it here
  // makes JwtAuthGuard usable from any module (passport strategies are
  // process-wide once instantiated).
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}