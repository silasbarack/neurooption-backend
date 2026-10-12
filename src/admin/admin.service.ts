import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { timingSafeEqual } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

const ADMIN_SELECT = { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true } as const;

import { PrismaService } from '../config/prisma.service';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async create(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Admin email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      12,
    );

    return this.prisma.admin.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        passwordHash,
      },
      select: ADMIN_SELECT,
    });
  }

  private readonly loginFailures = new Map<string, { count: number; since: number }>();

  async login(dto: AdminLoginDto) {
    const email = dto.email.trim().toLowerCase();
    const now = Date.now();
    const failures = this.loginFailures.get(email);
    if (failures && now - failures.since < 15 * 60_000 && failures.count >= 5) {
      throw new HttpException('Too many sign-in attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const admin = await this.prisma.admin.findUnique({
      where: {
        email,
      },
    });

    const valid = admin ? await bcrypt.compare(dto.password, admin.passwordHash) : false;
    if (!valid || !admin?.isActive) {
      const previous = failures && now - failures.since < 15 * 60_000 ? failures.count : 0;
      this.loginFailures.set(email, { count: previous + 1, since: failures?.since && now - failures.since < 15 * 60_000 ? failures.since : now });
      throw new UnauthorizedException('Invalid admin credentials.');
    }

    this.loginFailures.delete(email);
    const token = await this.jwt.signAsync(
      { sub: admin.id, purpose: 'admin-dashboard' },
      { expiresIn: '8h', issuer: 'neurooption-admin', audience: 'neurooption-admin-dashboard' },
    );
    return {
      message: 'Login successful',
      token,
      adminId: admin.id,
      role: admin.role,
      admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role },
    };
  }


  /** The temporary owner authorization configured in Render, or null when absent or expired. */
  private ownerAuthorization(): { code: string; email: string } | null {
    const code = process.env.ADMIN_BOOTSTRAP_KEY?.trim() || '';
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || '';
    const expiresAt = Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || '');
    if (code.length < 40 || !email || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
    return { code, email };
  }

  private requireOwner(setupKey: unknown, email: unknown): string {
    const owner = this.ownerAuthorization();
    if (!owner) throw new UnauthorizedException('Administrator setup is unavailable or expired.');
    const key = String(setupKey || '');
    if (key.length !== owner.code.length || !timingSafeEqual(Buffer.from(key), Buffer.from(owner.code))) {
      throw new UnauthorizedException('Invalid administrator setup authorization.');
    }
    const normalized = String(email || '').trim().toLowerCase();
    if (normalized !== owner.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      throw new UnauthorizedException('Administrator email is not authorized.');
    }
    return normalized;
  }

  private assertStrongPassword(password: string): void {
    if (password.length < 14 || password.length > 128 ||
        !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new BadRequestException('Password must be 14–128 characters with uppercase, lowercase, a number and a symbol.');
    }
  }

  /**
   * "create" while no administrator exists; "reset" once one does, so the owner
   * can recover the Super Administrator password. Public response never includes
   * the expected email or setup code.
   */
  async bootstrapStatus(): Promise<{ available: boolean; mode?: 'create' | 'reset' }> {
    if (!this.ownerAuthorization()) return { available: false };
    const adminCount = await this.prisma.admin.count();
    return { available: true, mode: adminCount === 0 ? 'create' : 'reset' };
  }

  async bootstrapFirstAdmin(body: { fullName?: string; email?: string; password?: string; setupKey?: string }) {
    const email = this.requireOwner(body?.setupKey, body?.email);
    const fullName = String(body?.fullName || '').trim();
    const password = String(body?.password || '');
    if (fullName.length < 3 || fullName.length > 100) {
      throw new BadRequestException('Enter a full name between 3 and 100 characters.');
    }
    this.assertStrongPassword(password);
    if (await this.prisma.admin.count() !== 0) {
      throw new ConflictException('An administrator is already provisioned. Initial setup is closed.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await this.prisma.admin.create({
      data: { fullName, email, passwordHash, role: 'SUPER_ADMIN', isActive: true },
      select: ADMIN_SELECT,
    });
    return { success: true, message: 'First Super Administrator created. Sign in with your new credentials.', role: admin.role };
  }

  /** Owner recovery: sets a new password for the Super Administrator whose email is authorized in Render. */
  async bootstrapResetPassword(body: { email?: string; password?: string; setupKey?: string }) {
    const email = this.requireOwner(body?.setupKey, body?.email);
    const password = String(body?.password || '');
    this.assertStrongPassword(password);

    const admin = await this.prisma.admin.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new NotFoundException('No Super Administrator uses this email.');
    }
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(password, 12), isActive: true },
    });
    this.loginFailures.delete(email);
    return { success: true, message: 'Super Administrator password reset. Sign in with your new password.' };
  }

  async findAll() {
    return this.prisma.admin.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: ADMIN_SELECT,
    });
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: ADMIN_SELECT,
    });

    if (!admin) {
      throw new NotFoundException(
        'Admin not found',
      );
    }

    return admin;
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
  ) {
    await this.findOne(id);

    return this.prisma.admin.update({
      where: { id },
      data: dto,
      select: ADMIN_SELECT,
    });
  }

  async disable(id: string) {
    return this.prisma.admin.update({
      where: { id },
      data: {
        isActive: false,
      },
      select: ADMIN_SELECT,
    });
  }

  async enable(id: string) {
    return this.prisma.admin.update({
      where: { id },
      data: {
        isActive: true,
      },
      select: ADMIN_SELECT,
    });
  }

  async delete(id: string) {
    return this.prisma.admin.delete({
      where: { id },
      select: ADMIN_SELECT,
    });
  }
}