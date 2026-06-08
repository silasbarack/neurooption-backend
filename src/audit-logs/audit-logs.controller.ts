import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(dto);
  }

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get('admin/:adminId')
  findByAdmin(@Param('adminId') adminId: string) {
    return this.auditLogsService.findByAdmin(adminId);
  }

  @Get('target/:targetType/:targetId')
  findByTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.auditLogsService.findByTarget(targetType, targetId);
  }
}