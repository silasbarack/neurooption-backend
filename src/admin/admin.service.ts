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


  async bootstrapStatus(): Promise<{ available: boolean }> {
    // Public response never includes the expected email or setup code.
    const permitted = Boolean(
      process.env.ADMIN_BOOTSTRAP_KEY?.trim() &&
      process.env.ADMIN_BOOTSTRAP_EMAIL?.trim() &&
      (process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || '') &&
      Number.isFinite(Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || '')) &&
      Date.now() < Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || ''),
    );
    if (!permitted) return { available: false };
    const adminCount = await this.prisma.admin.count();
    return { available: adminCount === 0 };
  }

  async bootstrapFirstAdmin(body: { fullName?: string; email?: string; password?: string; setupKey?: string }) {
    const configuredCode = process.env.ADMIN_BOOTSTRAP_KEY?.trim() || '';
    const permittedEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || '';
    const expiresAt = Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT || '');
    if (!configuredCode || configuredCode.length < 40 ||
        !permittedEmail || !Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      throw new UnauthorizedException('Administrator setup is unavailable or expired.');
    }

    const setupKey = String(body?.setupKey || '');
    if (setupKey.length !== configuredCode.length ||
        !timingSafeEqual(Buffer.from(setupKey), Buffer.from(configuredCode))) {
      throw new UnauthorizedException('Invalid administrator setup authorization.');
    }

    const fullName = String(body?.fullName || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    if (email !== permittedEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new UnauthorizedException('Administrator email is not authorized.');
    }
    if (fullName.length < 3 || fullName.length > 100) {
      throw new BadRequestException('Enter a full name between 3 and 100 characters.');
    }
    if (password.length < 14 || password.length > 128 ||
        !/[A-Z]/.test(password) || !/[a-z]/.test(password) ||
        !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      throw new BadRequestException('Password must be 14–128 characters with uppercase, lowercase, a number and a symbol.');
    }
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