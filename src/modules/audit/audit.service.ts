import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(userId: string, action: string, data?: any, meta?: { ip?: string; ua?: string }): Promise<void> {
    await this.repo.save(this.repo.create({ userId, action, data, ipAddress: meta?.ip, userAgent: meta?.ua }));
  }

  async getAuditLog(userId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({ where: { userId }, order: { createdAt: 'DESC' }, skip: (page-1)*limit, take: limit });
    return { data, total, page, limit };
  }
}
