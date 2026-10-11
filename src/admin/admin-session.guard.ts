import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';

export type AdminIdentity = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; admin?: AdminIdentity }>();
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new UnauthorizedException('Admin sign-in required.');
    const token = header.slice(7).trim();
    if (!token) throw new UnauthorizedException('Admin sign-in required.');

    let payload: { sub?: string; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(token, {
        issuer: 'neurooption-admin',
        audience: 'neurooption-admin-dashboard',
      });
    } catch {
      throw new UnauthorizedException('Admin session expired or invalid.');
    }

    if (!payload.sub || payload.purpose !== 'admin-dashboard') {
      throw new UnauthorizedException('Admin session invalid.');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, fullName: true, email: true, role: true, isActive: true },
    });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Admin access revoked.');
    req.admin = { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role };
    return true;
  }
}
