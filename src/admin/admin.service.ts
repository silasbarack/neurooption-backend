import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

const ADMIN_SELECT = { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true } as const;

import { PrismaService } from '../config/prisma.service';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
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

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!admin) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    if (!admin.isActive) {
      throw new UnauthorizedException(
        'Admin disabled',
      );
    }

    return {
      message: 'Login successful',
      adminId: admin.id,
      role: admin.role,
    };
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