"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealMarketsService = void 0;
const common_1 = require("@nestjs/common");
let RealMarketsService = class RealMarketsService {
    constructor() {
        this.symbols = [
            this.buildSymbol('EURUSD', 'EUR/USD', 'FOREX_PROVIDER'),
            this.buildSymbol('GBPUSD', 'GBP/USD', 'FOREX_PROVIDER'),
            this.buildSymbol('USDJPY', 'USD/JPY', 'FOREX_PROVIDER'),
            this.buildSymbol('BTCUSD', 'Bitcoin/USD', 'CRYPTO_PROVIDER'),
        ];
    }
    create(dto) {
        const exists = this.symbols.find((item) => item.symbol === dto.symbol);
        if (exists) {
            throw new common_1.BadRequestException('Real market symbol already exists');
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
    findOne(symbol) {
        const found = this.symbols.find((item) => item.symbol === symbol);
        if (!found) {
            throw new common_1.NotFoundException('Real market symbol not found');
        }
        return found;
    }
    update(symbol, dto) {
        const found = this.findOne(symbol);
        if (dto.displayName !== undefined)
            found.displayName = dto.displayName;
        if (dto.source !== undefined)
            found.source = dto.source;
        if (dto.isActive !== undefined)
            found.isActive = dto.isActive;
        return found;
    }
    remove(symbol) {
        const found = this.findOne(symbol);
        this.symbols = this.symbols.filter((item) => item.symbol !== symbol);
        return found;
    }
    buildSymbol(symbol, displayName, source) {
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
};
exports.RealMarketsService = RealMarketsService;
exports.RealMarketsService = RealMarketsService = __decorate([
    (0, common_1.Injectable)()
], RealMarketsService);
//# sourceMappingURL=real-markets.service.js.map