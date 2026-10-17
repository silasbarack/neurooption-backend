import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpiriesService } from './expiries.service';
import { CreateExpiryDto } from './dto/create-expiry.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';
import { AdminSessionGuard } from '../admin/admin-session.guard';
import { AdminSuperGuard } from '../admin/admin-super.guard';

/** Internal tooling only: not used by the client app. Super Administrators only. */
@UseGuards(AdminSessionGuard, AdminSuperGuard)
@Controller('expiries')
export class ExpiriesController {
  constructor(private readonly expiriesService: ExpiriesService) {}

  @Post()
  create(@Body() dto: CreateExpiryDto) {
    return this.expiriesService.create(dto);
  }

  @Get()
  findAll() {
    return this.expiriesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.expiriesService.findActive();
  }

  @Get(':duration')
  findOne(@Param('duration') duration: string) {
    return this.expiriesService.findOne(duration);
  }

  @Patch(':duration')
  update(
    @Param('duration') duration: string,
    @Body() dto: UpdateExpiryDto,
  ) {
    return this.expiriesService.update(duration, dto);
  }

  @Delete(':duration')
  remove(@Param('duration') duration: string) {
    return this.expiriesService.remove(duration);
  }
}