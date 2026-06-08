import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountCurrency,
  AccountStatus,
  AccountType,
  KycStatus,
  User,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserKycStatusDto } from './dto/update-user-kyc-status.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type FindAllOptions = {
  page?: number;
  // `limit` is what controllers commonly pass; keep `take` for compatibility
  limit?: number;
  take?: number;
  // allow either `q` (query param) or `search` to be passed in
  q?: string;
  search?: string;
  status?: AccountStatus;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailsService: EmailsService,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) throw new ConflictException('Email already exists');

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) throw new ConflictException('Phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone || null,
        passwordHash,
        status: AccountStatus.PENDING_KYC,
        kycStatus: KycStatus.NOT_SUBMITTED,
        wallets: {
          create: [
            { currency: 'KES', balance: 0, locked: 0 },
            { currency: 'USD', balance: 0, locked: 0 },
          ],
        },
        tradingAccounts: {
          create: [
            {
              type: AccountType.DEMO,
              currency: AccountCurrency.USD,
              balance: 70000,
              locked: 0,
            },
            {
              type: AccountType.REAL,
              currency: AccountCurrency.KES,
              balance: 0,
              locked: 0,
            },
          ],
        },
      },
      include: this.includeRelations(),
    });

    const createdUser = this.sanitizeUser(user);

    const sent = await this.emailsService.sendAccountCreatedEmail(
      createdUser.email,
      createdUser.fullName,
    );
    if (!sent) {
      this.logger.warn(
        `Account created but welcome email could not be sent to ${createdUser.email}`,
      );
    }

    return createdUser;
  }

  async findAll(opts?: FindAllOptions) {
    // default: return all (backwards compatible)
    if (!opts) {
      const users = await this.prisma.user.findMany({
        include: this.includeRelations(),
        orderBy: { createdAt: 'desc' },
      });
      return users.map((u) => this.sanitizeUser(u));
    }

    const { page = 1, limit, take = 20, q, search, status } = opts;
    // controller passes `limit`; prefer it over `take` when provided
    const resolvedTake = typeof limit === 'number' ? limit : take;
    const resolvedSearch = q ?? search;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status) where.status = status;

    const users = await this.prisma.user.findMany({
      where,
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * resolvedTake,
      take: resolvedTake,
    });

    return users.map((u) => this.sanitizeUser(u));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!user) throw new NotFoundException('User not found');

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.includeRelations(),
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingEmail && existingEmail.id !== id)
        throw new ConflictException('Email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone && existingPhone.id !== id)
        throw new ConflictException('Phone already exists');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
      },
      include: this.includeRelations(),
    });

    return this.sanitizeUser(updated);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: this.includeRelations(),
    });
    return this.sanitizeUser(updated);
  }

  async updateKycStatus(id: string, dto: UpdateUserKycStatusDto) {
    await this.findOne(id);
    const status =
      dto.kycStatus === KycStatus.APPROVED
        ? AccountStatus.ACTIVE
        : AccountStatus.PENDING_KYC;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { kycStatus: dto.kycStatus, status },
      include: this.includeRelations(),
    });

    return this.sanitizeUser(updated);
  }

  async suspend(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: AccountStatus.SUSPENDED },
      include: this.includeRelations(),
    });
    return this.sanitizeUser(updated);
  }

  async lock(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: AccountStatus.LOCKED },
      include: this.includeRelations(),
    });
    return this.sanitizeUser(updated);
  }

  async activate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.kycStatus !== KycStatus.APPROVED)
      throw new BadRequestException('User KYC must be approved first');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: AccountStatus.ACTIVE },
      include: this.includeRelations(),
    });
    return this.sanitizeUser(updated);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    const deleted = await this.prisma.user.delete({ where: { id } });

    const sent = await this.emailsService.sendAccountDeletedEmail(
      user.email,
      user.fullName,
    );
    if (!sent) {
      this.logger.warn(
        `Account deleted but notification email could not be sent to ${user.email}`,
      );
    }

    return this.sanitizeUser(deleted);
  }

  private includeRelations() {
    return {
      wallets: true,
      tradingAccounts: true,
      trades: true,
      transactions: true,
      kycRecords: true,
      deposits: true,
      withdrawals: true,
      payouts: true,
      supportTickets: true,
      notifications: true,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}