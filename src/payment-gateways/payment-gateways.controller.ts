import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentGatewayType } from '@prisma/client';

import { CreatePaymentGatewayDto } from './dto/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from './dto/update-payment-gateway.dto';
import { PaymentGatewaysService } from './payment-gateways.service';

@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(private readonly service: PaymentGatewaysService) {}

  @Post()
  create(@Body() dto: CreatePaymentGatewayDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  @Get('type/:type')
  findByType(@Param('type') type: PaymentGatewayType) {
    return this.service.findByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentGatewayDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/enable')
  enable(@Param('id') id: string) {
    return this.service.enable(id);
  }

  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return this.service.disable(id);
  }
}