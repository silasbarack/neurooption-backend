import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Requires a valid Bearer JWT (validated by JwtStrategy). `req.user` is then
 * the safe user record (passwordHash stripped) returned from
 * JwtStrategy.validate().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
