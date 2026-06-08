import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CopyTradeStatus,
  Prisma,
  SocialFollowStatus,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreateCopyTradeDto } from './dto/create-copy-trade.dto';
import { CreateSocialFollowDto } from './dto/create-social-follow.dto';
import { UpdateCopyTradeDto } from './dto/update-copy-trade.dto';
import { UpdateSocialFollowDto } from './dto/update-social-follow.dto';

@Injectable()
export class SocialTradingService {
  constructor(private readonly prisma: PrismaService) {}

  async followTrader(dto: CreateSocialFollowDto) {
    if (dto.followerUserId === dto.traderUserId) {
      throw new BadRequestException('User cannot follow themselves');
    }

    const follower = await this.prisma.user.findUnique({
      where: { id: dto.followerUserId },
    });

    if (!follower) {
      throw new NotFoundException('Follower user not found');
    }

    const trader = await this.prisma.user.findUnique({
      where: { id: dto.traderUserId },
    });

    if (!trader) {
      throw new NotFoundException('Trader user not found');
    }

    const exists = await this.prisma.socialFollow.findUnique({
      where: {
        followerUserId_traderUserId: {
          followerUserId: dto.followerUserId,
          traderUserId: dto.traderUserId,
        },
      },
    });

    if (exists) {
      throw new ConflictException('Follower already follows this trader');
    }

    return this.prisma.socialFollow.create({
      data: {
        followerUserId: dto.followerUserId,
        traderUserId: dto.traderUserId,
        copyPercentage: new Prisma.Decimal(dto.copyPercentage).div(100),
        maxStakeAmount:
          dto.maxStakeAmount !== undefined
            ? new Prisma.Decimal(dto.maxStakeAmount)
            : undefined,
        minStakeAmount:
          dto.minStakeAmount !== undefined
            ? new Prisma.Decimal(dto.minStakeAmount)
            : undefined,
        status: SocialFollowStatus.ACTIVE,
      },
      include: this.followInclude(),
    });
  }

  async findAllFollows() {
    return this.prisma.socialFollow.findMany({
      include: this.followInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findFollowersOfTrader(traderUserId: string) {
    return this.prisma.socialFollow.findMany({
      where: {
        traderUserId,
      },
      include: this.followInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findTradersFollowedByUser(followerUserId: string) {
    return this.prisma.socialFollow.findMany({
      where: {
        followerUserId,
      },
      include: this.followInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findFollow(id: string) {
    const follow = await this.prisma.socialFollow.findUnique({
      where: { id },
      include: this.followInclude(),
    });

    if (!follow) {
      throw new NotFoundException('Social follow record not found');
    }

    return follow;
  }

  async updateFollow(id: string, dto: UpdateSocialFollowDto) {
    await this.findFollow(id);

    return this.prisma.socialFollow.update({
      where: { id },
      data: {
        status: dto.status,
        copyPercentage:
          dto.copyPercentage !== undefined
            ? new Prisma.Decimal(dto.copyPercentage).div(100)
            : undefined,
        maxStakeAmount:
          dto.maxStakeAmount !== undefined
            ? new Prisma.Decimal(dto.maxStakeAmount)
            : undefined,
        minStakeAmount:
          dto.minStakeAmount !== undefined
            ? new Prisma.Decimal(dto.minStakeAmount)
            : undefined,
      },
      include: this.followInclude(),
    });
  }

  async pauseFollow(id: string) {
    return this.updateFollow(id, {
      status: SocialFollowStatus.PAUSED,
    });
  }

  async resumeFollow(id: string) {
    return this.updateFollow(id, {
      status: SocialFollowStatus.ACTIVE,
    });
  }

  async stopFollow(id: string) {
    return this.updateFollow(id, {
      status: SocialFollowStatus.STOPPED,
    });
  }

  async createCopyTrade(dto: CreateCopyTradeDto) {
    const follow = await this.prisma.socialFollow.findUnique({
      where: { id: dto.socialFollowId },
    });

    if (!follow) {
      throw new NotFoundException('Social follow record not found');
    }

    if (follow.status !== SocialFollowStatus.ACTIVE) {
      throw new BadRequestException('Social follow is not active');
    }

    const masterTrade = await this.prisma.trade.findUnique({
      where: { id: dto.masterTradeId },
    });

    if (!masterTrade) {
      throw new NotFoundException('Master trade not found');
    }

    return this.prisma.socialFollow.update({
      where: { id: dto.socialFollowId },
      data: {
        copiedTrades: {
          increment: 1,
        },
        copies: {
          create: {
            masterUserId: dto.masterUserId,
            followerUserId: dto.followerUserId,
            masterTradeId: dto.masterTradeId,
            followerTradeId: dto.followerTradeId,
            stakeAmount: new Prisma.Decimal(dto.stakeAmount),
            payoutRate: new Prisma.Decimal(dto.payoutRate),
            entryPrice: new Prisma.Decimal(dto.entryPrice),
            status: CopyTradeStatus.OPEN,
          },
        },
      },
      include: this.followInclude(),
    });
  }

  async findCopyTrades() {
    return this.prisma.copyTrade.findMany({
      include: this.copyTradeInclude(),
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  async findCopyTradesByFollower(followerUserId: string) {
    return this.prisma.copyTrade.findMany({
      where: { followerUserId },
      include: this.copyTradeInclude(),
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  async findCopyTradesByMaster(masterUserId: string) {
    return this.prisma.copyTrade.findMany({
      where: { masterUserId },
      include: this.copyTradeInclude(),
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  async updateCopyTrade(id: string, dto: UpdateCopyTradeDto) {
    const copyTrade = await this.prisma.copyTrade.findUnique({
      where: { id },
    });

    if (!copyTrade) {
      throw new NotFoundException('Copy trade not found');
    }

    return this.prisma.copyTrade.update({
      where: { id },
      data: {
        status: dto.status,
        exitPrice:
          dto.exitPrice !== undefined
            ? new Prisma.Decimal(dto.exitPrice)
            : undefined,
        profitAmount:
          dto.profitAmount !== undefined
            ? new Prisma.Decimal(dto.profitAmount)
            : undefined,
        closedAt:
          dto.status &&
          dto.status !== CopyTradeStatus.OPEN
            ? new Date()
            : undefined,
      },
      include: this.copyTradeInclude(),
    });
  }

  private followInclude() {
    return {
      follower: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      trader: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      copies: true,
    };
  }

  private copyTradeInclude() {
    return {
      socialFollow: true,
      masterUser: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      followerUser: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      masterTrade: true,
    };
  }
}