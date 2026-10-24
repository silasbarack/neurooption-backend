import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRealSymbolDto } from './dto/create-real-symbol.dto';
import { UpdateRealSymbolDto } from './dto/update-real-symbol.dto';

@Injectable()
export class RealMarketsService {
  private symbols = [
    this.buildSymbol('EURUSD', 'EUR/USD', 'FOREX_PROVIDER'),
    this.buildSymbol('GBPUSD', 'GBP/USD', 'FOREX_PROVIDER'),
    this.buildSymbol('USDJPY', 'USD/JPY', 'FOREX_PROVIDER'),
    this.buildSymbol('BTCUSD', 'Bitcoin/USD', 'CRYPTO_PROVIDER'),
  ];

  create(dto: CreateRealSymbolDto) {
    const exists = this.symbols.find((item) => item.symbol === dto.symbol);

    if (exists) {
      throw new BadRequestException('Real market symbol already exists');
    }

    const symbol = {
      ...this.buildSymbol(dto.symbol, dto.displayName, dto.source),
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
      throw new NotFoundException('Real market symbol not found');
    }

    return found;
  }

  update(symbol: string, dto: UpdateRealSymbolDto) {
    const found = this.findOne(symbol);

    if (dto.displayName !== undefined) found.displayName = dto.displayName;
    if (dto.source !== undefined) found.source = dto.source;
    if (dto.isActive !== undefined) found.isActive = dto.isActive;

    return found;
  }

  remove(symbol: string) {
    const found = this.findOne(symbol);
    this.symbols = this.symbols.filter((item) => item.symbol !== symbol);
    return found;
  }

  private buildSymbol(symbol: string, displayName: string, source: string) {
    return {
      id: crypto.randomUUID(),
      symbol,
      displayName,
      source,
      marketType: 'REAL',
      isActive: true,
      createdAt: new Date(),
    };
  }
}