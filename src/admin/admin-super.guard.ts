import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminSuperGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ admin?: { role?: string } }>();
    if (req.admin?.role !== 'SUPER_ADMIN') throw new ForbiddenException('Super Administrator permission required.');
    return true;
  }
}
