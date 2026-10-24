import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpiryDto } from './dto/create-expiry.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';

@Injectable()
export class ExpiriesService {
  private expiries = [
    this.buildExpiry('00:00:05'),
    this.buildExpiry('00:00:10'),
    this.buildExpiry('00:00:15'),
    this.buildExpiry('00:00:30'),
    this.buildExpiry('00:01:00'),
    this.buildExpiry('00:02:00'),
    this.buildExpiry('00:02:30'),
    this.buildExpiry('00:05:00'),
    this.buildExpiry('00:10:00'),
    this.buildExpiry('00:15:00'),
    this.buildExpiry('00:30:00'),
    this.buildExpiry('01:00:00'),
    this.buildExpiry('02:00:00'),
    this.buildExpiry('05:00:00'),
  ];

  create(dto: CreateExpiryDto) {
    const seconds = this.toSeconds(dto.duration);

    if (seconds < 5 || seconds > 18_000) {
      throw new BadRequestException('Expiry must be between 00:00:05 and 05:00:00');
    }

    const exists = this.expiries.find((item) => item.duration === dto.duration);

    if (exists) {
      throw new BadRequestException('Expiry already exists');
    }

    const expiry = {
      ...this.buildExpiry(dto.duration),
      isActive: dto.isActive ?? true,
    };

    this.expiries.push(expiry);
    return expiry;
  }

  findAll() {
    return this.expiries;
  }

  findActive() {
    return this.expiries.filter((item) => item.isActive);
  }

  findOne(duration: string) {
    const expiry = this.expiries.find((item) => item.duration === duration);

    if (!expiry) {
      throw new NotFoundException('Expiry not found');
    }

    return expiry;
  }

  update(duration: string, dto: UpdateExpiryDto) {
    const expiry = this.findOne(duration);

    if (dto.isActive !== undefined) {
      expiry.isActive = dto.isActive;
    }

    return expiry;
  }

  remove(duration: string) {
    const expiry = this.findOne(duration);
    this.expiries = this.expiries.filter((item) => item.duration !== duration);
    return expiry;
  }

  private buildExpiry(duration: string) {
    return {
      id: crypto.randomUUID(),
      duration,
      seconds: this.toSeconds(duration),
      label: this.toLabel(duration),
      isActive: true,
    };
  }

  private toSeconds(duration: string): number {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }

  private toLabel(duration: string): string {
    const [hours, minutes, seconds] = duration.split(':').map(Number);

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }
}