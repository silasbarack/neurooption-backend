import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTimeframeDto, TimeframeCode } from './dto/create-timeframe.dto';
import { UpdateTimeframeDto } from './dto/update-timeframe.dto';

@Injectable()
export class TimeframesService {
  private timeframes = [
    this.buildTimeframe(TimeframeCode.S5),
    this.buildTimeframe(TimeframeCode.S10),
    this.buildTimeframe(TimeframeCode.S15),
    this.buildTimeframe(TimeframeCode.S30),

    this.buildTimeframe(TimeframeCode.M1),
    this.buildTimeframe(TimeframeCode.M2),
    this.buildTimeframe(TimeframeCode.M3),
    this.buildTimeframe(TimeframeCode.M5),
    this.buildTimeframe(TimeframeCode.M10),
    this.buildTimeframe(TimeframeCode.M15),
    this.buildTimeframe(TimeframeCode.M30),

    this.buildTimeframe(TimeframeCode.H1),
    this.buildTimeframe(TimeframeCode.H4),
    this.buildTimeframe(TimeframeCode.D1),
  ];

  create(dto: CreateTimeframeDto) {
    const exists = this.timeframes.find((item) => item.code === dto.code);

    if (exists) {
      throw new BadRequestException('Timeframe already exists');
    }

    const timeframe = {
      ...this.buildTimeframe(dto.code),
      isActive: dto.isActive ?? true,
    };

    this.timeframes.push(timeframe);
    return timeframe;
  }

  findAll() {
    return this.timeframes;
  }

  findActive() {
    return this.timeframes.filter((item) => item.isActive);
  }

  findOne(code: TimeframeCode) {
    const timeframe = this.timeframes.find((item) => item.code === code);

    if (!timeframe) {
      throw new NotFoundException('Timeframe not found');
    }

    return timeframe;
  }

  update(code: TimeframeCode, dto: UpdateTimeframeDto) {
    const timeframe = this.findOne(code);

    if (dto.isActive !== undefined) {
      timeframe.isActive = dto.isActive;
    }

    return timeframe;
  }

  remove(code: TimeframeCode) {
    const timeframe = this.findOne(code);
    this.timeframes = this.timeframes.filter((item) => item.code !== code);
    return timeframe;
  }

  private buildTimeframe(code: TimeframeCode) {
    return {
      id: crypto.randomUUID(),
      code,
      seconds: this.toSeconds(code),
      label: this.toLabel(code),
      isActive: true,
    };
  }

  private toSeconds(code: TimeframeCode): number {
    const value = Number(code.slice(1));

    if (code.startsWith('S')) return value;
    if (code.startsWith('M')) return value * 60;
    if (code.startsWith('H')) return value * 60 * 60;
    if (code.startsWith('D')) return value * 24 * 60 * 60;

    throw new BadRequestException('Invalid timeframe code');
  }

  private toLabel(code: TimeframeCode): string {
    const value = Number(code.slice(1));

    if (code.startsWith('S')) return `${value} seconds`;
    if (code.startsWith('M')) return `${value} minutes`;
    if (code.startsWith('H')) return `${value} hours`;
    if (code.startsWith('D')) return `${value} day`;

    throw new BadRequestException('Invalid timeframe code');
  }
}