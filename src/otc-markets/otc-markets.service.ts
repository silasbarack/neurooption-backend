import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOtcSymbolDto } from './dto/create-otc-symbol.dto';
import { UpdateOtcSymbolDto } from './dto/update-otc-symbol.dto';

@Injectable()
export class OtcMarketsService {
  private symbols = [
    this.buildSymbol('EURUSD-OTC', 'EUR/USD OTC'),
    this.buildSymbol('GBPUSD-OTC', 'GBP/USD OTC'),
    this.buildSymbol('USDJPY-OTC', 'USD/JPY OTC'),
    this.buildSymbol('BTCUSD-OTC', 'Bitcoin OTC'),
  ];

  create(dto: CreateOtcSymbolDto) {
    const exists = this.symbols.find((item) => item.symbol === dto.symbol);

    if (exists) {
      throw new BadRequestException('OTC symbol already exists');
    }

    const symbol = {
      ...this.buildSymbol(dto.symbol, dto.displayName),
      isActive: dto.isActive ?? true,
    };

    this.symbols.push(symbol);
    return symbol;
  }

  findAll() {
    return this.symbols;
  }

  findActive() {
    return this.symbols.filter((item) => item.isActive);
  }

  findOne(symbol: string) {
    const found = this.symbols.find((item) => item.symbol === symbol);

    if (!found) {
      throw new NotFoundException('OTC symbol not found');
    }

    return found;
  }

  update(symbol: string, dto: UpdateOtcSymbolDto) {
    const found = this.findOne(symbol);

    if (dto.displayName !== undefined) found.displayName = dto.displayName;
    if (dto.isActive !== undefined) found.isActive = dto.isActive;

    return found;
  }

  remove(symbol: string) {
    const found = this.findOne(symbol);
    this.symbols = this.symbols.filter((item) => item.symbol !== symbol);
    return found;
  }

  private buildSymbol(symbol: string, displayName: string) {
    return {
      id: crypto.randomUUID(),
      symbol,
      displayName,
      marketType: 'OTC',
      isActive: true,
      createdAt: new Date(),
    };
  }
}