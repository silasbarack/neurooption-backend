import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

export type UpdateUserPayload = {
  fullName?: string;
  name?: string;
  phone?: string;
  country?: string;
  currency?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserModelFields(): string[] {
    const runtimeModel = (this.prisma as any)?._runtimeDataModel?.models?.User;

    if (!runtimeModel?.fields) {
      return [];
    }

    return runtimeModel.fields.map((field: any) => field.name);
  }

  private hasUserField(fieldName: string): boolean {
    return this.getUserModelFields().includes(fieldName);
  }

  private removePassword(user: any) {
    if (!user) return null;

    const {
      password,
      passwordHash,
      hashedPassword,
      resetToken,
      resetPasswordToken,
      ...safeUser
    } = user;

    return safeUser;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      } as any,
    });

    return users.map((user) => this.removePassword(user));
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    return this.removePassword(user);
  }

  async getMe(userId: string) {
    return this.findById(userId);
  }

  async updateMe(userId: string, payload: UpdateUserPayload) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User account not found.');
    }

    const data: Record<string, any> = {};

    if (this.hasUserField('fullName')) {
      data.fullName =
        payload.fullName ??
        payload.name ??
        (existingUser as any).fullName;
    }

    if (this.hasUserField('name')) {
      data.name =
        payload.name ??
        payload.fullName ??
        (existingUser as any).name;
    }

    if (this.hasUserField('phone')) {
      data.phone = payload.phone ?? (existingUser as any).phone;
    }

    if (this.hasUserField('country')) {
      data.country = payload.country ?? (existingUser as any).country;
    }

    if (this.hasUserField('currency')) {
      data.currency = payload.currency ?? (existingUser as any).currency;
    }

    if (Object.keys(data).length === 0) {
      return this.removePassword(existingUser);
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: data as any,
    });

    return this.removePassword(updatedUser);
  }
}
