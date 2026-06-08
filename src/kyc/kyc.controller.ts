import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { KycService } from './kyc.service';

import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
  ) {}

  @Post()
  submit(
    @Body() dto: CreateKycDto,
  ) {
    return this.kycService.submit(dto);
  }

  @Get()
  findAll() {
    return this.kycService.findAll();
  }

  @Get('pending')
  pending() {
    return this.kycService.pending();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.kycService.findOne(id);
  }

  @Patch(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
  ) {
    return this.kycService.approve(
      id,
      dto,
    );
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
  ) {
    return this.kycService.reject(
      id,
      dto,
    );
  }
}