import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';

export type UpdateUserPayload = {
  fullName?: string;
  name?: string;
  phone?: string;
  country?: string;
  currency?: string;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailsService: EmailsService,
  ) {}

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

  private getUserDisplayName(user: any): string {
    return (
      user?.fullName ||
      user?.name ||
      user?.email?.split('@')?.[0] ||
      'Trader'
    );
  }

  private async sendAccountDeletedEmailSafely(user: any): Promise<void> {
    try {
      const emailService = this.emailsService as any;

      if (typeof emailService.sendAccountDeletedEmail !== 'function') {
        this.logger.warn(
          'EmailsService.sendAccountDeletedEmail does not exist. Skipping account deletion email.',
        );
        return;
      }

      await emailService.sendAccountDeletedEmail({
        email: user.email,
        fullName: this.getUserDisplayName(user),
      });
    } catch (error) {
      this.logger.error('Account deletion email failed', error as Error);
    }
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

  async deleteMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    try {
      await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
    } catch (error: any) {
      this.logger.error('Account deletion failed', error);

      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'Account could not be deleted because it still has linked records.',
        );
      }

      throw new BadRequestException('Account could not be deleted.');
    }

    await this.sendAccountDeletedEmailSafely(user);

    return {
      success: true,
      message: 'Account deleted successfully.',
    };
  }
}