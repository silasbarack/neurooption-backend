import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentDirection, PaymentGatewayType } from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';

@Injectable()
export class PaymentGatewaysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentGatewayDto) {
    const exists = await this.prisma.paymentGateway.findUnique({
      where: {
        type_direction: {
          type: dto.type,
          direction: dto.direction,
        },
      },
    });

    if (exists) {
      throw new ConflictException('Payment gateway already exists');
    }

    return this.prisma.paymentGateway.create({
      data: {
        name: dto.name,
        type: dto.type,
        direction: dto.direction,
        isActive: dto.isActive ?? true,
        publicKey: dto.publicKey,
        secretKey: dto.secretKey,
        callbackUrl: dto.callbackUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.paymentGateway.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.paymentGateway.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(type: PaymentGatewayType) {
    return this.prisma.paymentGateway.findMany({
      where: { type },
    });
  }

  async findForDeposit(type: PaymentGatewayType) {
    const gateway = await this.prisma.paymentGateway.findUnique({
      where: {
        type_direction: {
          type,
          direction: PaymentDirection.IN,
        },
      },
    });

    if (!gateway) {
      throw new NotFoundException('Deposit gateway not found');
    }

    return gateway;
  }

  async findForWithdrawal(type: PaymentGatewayType) {
    const gateway = await this.prisma.paymentGateway.findUnique({
      where: {
        type_direction: {
          type,
          direction: PaymentDirection.OUT,
        },
      },
    });

    if (!gateway) {
      throw new NotFoundException('Withdrawal gateway not found');
    }

    return gateway;
  }

  async findOne(id: string) {
    const gateway = await this.prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new NotFoundException('Payment gateway not found');
    }

    return gateway;
  }

  async update(id: string, dto: UpdatePaymentGatewayDto) {
    await this.findOne(id);

    return this.prisma.paymentGateway.update({
      where: { id },
      data: dto,
    });
  }

  async enable(id: string) {
    return this.prisma.paymentGateway.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async disable(id: string) {
    return this.prisma.paymentGateway.update({
      where: { id },
      data: { isActive: false },
    });
  }
}