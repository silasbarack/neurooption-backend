"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataService = void 0;
const common_1 = require("@nestjs/common");
let MarketDataService = class MarketDataService {
    constructor() {
        this.prices = [
            this.buildPrice('EURUSD', 'REAL', 1.0842, 1.0844),
            this.buildPrice('GBPUSD', 'REAL', 1.2715, 1.2717),
            this.buildPrice('USDJPY', 'REAL', 156.22, 156.25),
            this.buildPrice('BTCUSD', 'REAL', 68000, 68020),
            this.buildPrice('EURUSD-OTC', 'OTC', 1.0838, 1.0840),
            this.buildPrice('GBPUSD-OTC', 'OTC', 1.2708, 1.2711),
            this.buildPrice('USDJPY-OTC', 'OTC', 156.10, 156.13),
        ];
    }
    findAll() {
        return this.prices;
    }
    findBySymbol(symbol) {
        const price = this.prices.find((item) => item.symbol === symbol);
        if (!price) {
            throw new common_1.NotFoundException('Market price not found');
        }
        return price;
    }
    findByMarketType(marketType) {
        return this.prices.filter((item) => item.marketType === marketType);
    }
    updatePrice(dto) {
        const existing = this.prices.find((item) => item.symbol === dto.symbol);
        const price = this.buildPrice(dto.symbol, dto.marketType, dto.bid, dto.ask);
        if (existing) {
            Object.assign(existing, price);
            return existing;
        }
        this.prices.push(price);
        return price;
    }
    getCurrentMidPrice(symbol) {
        return this.findBySymbol(symbol).mid;
    }
    buildPrice(symbol, marketType, bid, ask) {
        return {
            symbol,
            marketType,
            bid,
            ask,
            mid: Number(((bid + ask) / 2).toFixed(6)),
            timestamp: new Date(),
        };
    }
};
exports.MarketDataService = MarketDataService;
exports.MarketDataService = MarketDataService = __decorate([
    (0, common_1.Injectable)()
], MarketDataService);
//# sourceMappingURL=market-data.service.js.map