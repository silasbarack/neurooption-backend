import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountCurrency, AccountType, Prisma } from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreateTradingAccountDto } from './dto/create-trading-account.dto';
import { SwitchAccountCurrencyDto } from './dto/switch-account-currency.dto';
import { UpdateTradingAccountDto } from './dto/update-trading-account.dto';

@Injectable()
export class TradingAccountsService {
  private readonly demoStartingBalance = new Prisma.Decimal(70000);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTradingAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exists = await this.prisma.tradingAccount.findUnique({
      where: {
        userId_type_currency: {
          userId: dto.userId,
          type: dto.type,
          currency: dto.currency,
        },
      },
    });

    if (exists) {
      throw new ConflictException('Trading account already exists');
    }

    return this.prisma.tradingAccount.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        currency: dto.currency,
        balance:
          dto.type === AccountType.DEMO
            ? this.demoStartingBalance
            : new Prisma.Decimal(0),
        locked: 0,
        isActive: true,
      },
      include: this.includeRelations(),
    });
  }

  async createDefaultAccounts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const existingDemo = await tx.tradingAccount.findUnique({
        where: {
          userId_type_currency: {
            userId,
            type: AccountType.DEMO,
            currency: AccountCurrency.USD,
          },
        },
      });

      const existingReal = await tx.tradingAccount.findUnique({
        where: {
          userId_type_currency: {
            userId,
            type: AccountType.REAL,
            currency: AccountCurrency.KES,
          },
        },
      });

      const demo =
        existingDemo ??
        (await tx.tradingAccount.create({
          data: {
            userId,
            type: AccountType.DEMO,
            currency: AccountCurrency.USD,
            balance: this.demoStartingBalance,
            locked: 0,
            isActive: true,
          },
        }));

      const real =
        existingReal ??
        (await tx.tradingAccount.create({
          data: {
            userId,
            type: AccountType.REAL,
            currency: AccountCurrency.KES,
            balance: 0,
            locked: 0,
            isActive: true,
          },
        }));

      return {
        demo,
        real,
      };
    });
  }

  async findAll() {
    return this.prisma.tradingAccount.findMany({
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.tradingAccount.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserAndType(userId: string, type: AccountType) {
    return this.prisma.tradingAccount.findMany({
      where: {
        userId,
        type,
      },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.tradingAccount.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!account) {
      throw new NotFoundException('Trading account not found');
    }

    return account;
  }

  async switchCurrency(
    userId: string,
    type: AccountType,
    dto: SwitchAccountCurrencyDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.tradingAccount.findUnique({
      where: {
        userId_type_currency: {
          userId,
          type,
          currency: dto.currency,
        },
      },
      include: this.includeRelations(),
    });

    if (existing) {
      return existing;
    }

    return this.prisma.tradingAccount.create({
      data: {
        userId,
        type,
        currency: dto.currency,
        balance:
          type === AccountType.DEMO
            ? this.demoStartingBalance
            : new Prisma.Decimal(0),
        locked: 0,
        isActive: true,
      },
      include: this.includeRelations(),
    });
  }

  async resetDemoAccount(id: string) {
    const account = await this.findOne(id);

    if (account.type !== AccountType.DEMO) {
      throw new BadRequestException('Only demo accounts can be reset');
    }

    return this.prisma.tradingAccount.update({
      where: { id },
      data: {
        balance: this.demoStartingBalance,
        locked: 0,
      },
      include: this.includeRelations(),
    });
  }

  async update(id: string, dto: UpdateTradingAccountDto) {
    await this.findOne(id);

    return this.prisma.tradingAccount.update({
      where: { id },
      data: {
        isActive: dto.isActive,
      },
      include: this.includeRelations(),
    });
  }

  private includeRelations() {
    return {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      trades: true,
    };
  }
}