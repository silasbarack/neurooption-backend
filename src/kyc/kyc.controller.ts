import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  submit(@Req() req: { user: { id: string } }, @Body() dto: CreateKycDto) {
    if (dto.userId && dto.userId !== req.user.id) {
      throw new ForbiddenException('KYC may only be submitted for your own account.');
    }
    return this.kycService.submit({ ...dto, userId: req.user.id });
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() { return this.kycService.findAll(); }

  @Get('pending')
  @UseGuards(AdminGuard)
  pending() { return this.kycService.pending(); }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) { return this.kycService.findOne(id); }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  approve(@Param('id') id: string, @Body() dto: ReviewKycDto) { return this.kycService.approve(id, dto); }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string, @Body() dto: ReviewKycDto) { return this.kycService.reject(id, dto); }
}
