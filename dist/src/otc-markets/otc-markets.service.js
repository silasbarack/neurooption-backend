"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtcMarketsService = void 0;
const common_1 = require("@nestjs/common");
let OtcMarketsService = class OtcMarketsService {
    constructor() {
        this.symbols = [
            this.buildSymbol('EURUSD-OTC', 'EUR/USD OTC'),
            this.buildSymbol('GBPUSD-OTC', 'GBP/USD OTC'),
            this.buildSymbol('USDJPY-OTC', 'USD/JPY OTC'),
            this.buildSymbol('BTCUSD-OTC', 'Bitcoin OTC'),
        ];
    }
    create(dto) {
        const exists = this.symbols.find((item) => item.symbol === dto.symbol);
        if (exists) {
            throw new common_1.BadRequestException('OTC symbol already exists');
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
    findOne(symbol) {
        const found = this.symbols.find((item) => item.symbol === symbol);
        if (!found) {
            throw new common_1.NotFoundException('OTC symbol not found');
        }
        return found;
    }
    update(symbol, dto) {
        const found = this.findOne(symbol);
        if (dto.displayName !== undefined)
            found.displayName = dto.displayName;
        if (dto.isActive !== undefined)
            found.isActive = dto.isActive;
        return found;
    }
    remove(symbol) {
        const found = this.findOne(symbol);
        this.symbols = this.symbols.filter((item) => item.symbol !== symbol);
        return found;
    }
    buildSymbol(symbol, displayName) {
        return {
            id: crypto.randomUUID(),
            symbol,
            displayName,
            marketType: 'OTC',
            isActive: true,
            createdAt: new Date(),
        };
    }
};
exports.OtcMarketsService = OtcMarketsService;
exports.OtcMarketsService = OtcMarketsService = __decorate([
    (0, common_1.Injectable)()
], OtcMarketsService);
//# sourceMappingURL=otc-markets.service.js.map