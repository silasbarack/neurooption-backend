import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard, but lets requests without an Authorization header
 * through (req.user stays undefined). A header that is present but invalid
 * or expired is still rejected, so a signed-in client never silently falls
 * back to the guest account.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.headers?.authorization) return true;
    return super.canActivate(context);
  }
}
