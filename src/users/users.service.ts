import {
  Injectable, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { publicUser } from './public-user';

export type UpdateUserPayload = {
  fullName?: string; name?: string; phone?: string; country?: string; currency?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((user) => publicUser(user));
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || user.status === 'DELETED') throw new NotFoundException('User account not found.');
    return publicUser(user);
  }

  async getMe(userId: string) { return this.findById(userId); }

  async updateMe(userId: string, payload: UpdateUserPayload) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing || existing.deletedAt || existing.status === 'DELETED') throw new NotFoundException('User account not found.');
    const updated = await this.prisma.user.update({
      where: { id: userId, deletedAt: null, status: { not: 'DELETED' } },
      data: { fullName: payload.fullName ?? payload.name, phone: payload.phone },
    });
    return publicUser(updated);
  }

}
