import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AffiliatesService } from './affiliates.service';
import { CreateAffiliateCommissionDto } from './dto/create-affiliate-commission.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post()
  createAffiliate(@Body() dto: CreateAffiliateDto) {
    return this.affiliatesService.createAffiliate(dto);
  }

  @Get()
  findAllAffiliates() {
    return this.affiliatesService.findAllAffiliates();
  }

  @Get(':id')
  findAffiliateById(@Param('id') id: string) {
    return this.affiliatesService.findAffiliateById(id);
  }

  @Get('user/:userId')
  findAffiliateByUser(@Param('userId') userId: string) {
    return this.affiliatesService.findAffiliateByUser(userId);
  }

  @Patch(':id')
  updateAffiliate(
    @Param('id') id: string,
    @Body() dto: UpdateAffiliateDto,
  ) {
    return this.affiliatesService.updateAffiliate(id, dto);
  }

  @Post('commissions')
  createCommission(@Body() dto: CreateAffiliateCommissionDto) {
    return this.affiliatesService.createCommission(dto);
  }

  @Get('commissions/all')
  findAllCommissions() {
    return this.affiliatesService.findAllCommissions();
  }

  @Get(':affiliateId/commissions')
  findCommissionsByAffiliate(@Param('affiliateId') affiliateId: string) {
    return this.affiliatesService.findCommissionsByAffiliate(affiliateId);
  }

  @Patch('commissions/:id/status')
  updateCommissionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionStatusDto,
  ) {
    return this.affiliatesService.updateCommissionStatus(id, dto);
  }

  @Patch('commissions/:id/pay/:walletId')
  payCommission(
    @Param('id') id: string,
    @Param('walletId') walletId: string,
  ) {
    return this.affiliatesService.payCommission(id, walletId);
  }
}