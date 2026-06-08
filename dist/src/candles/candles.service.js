"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandlesService = void 0;
const common_1 = require("@nestjs/common");
const create_candle_dto_1 = require("./dto/create-candle.dto");
let CandlesService = class CandlesService {
    constructor() {
        this.candles = [];
    }
    create(dto) {
        const candle = {
            id: crypto.randomUUID(),
            ...dto,
            openedAt: new Date(dto.openedAt),
            closedAt: new Date(dto.closedAt),
            createdAt: new Date(),
        };
        this.candles.push(candle);
        return candle;
    }
    findAll() {
        return this.candles;
    }
    findByQuery(query) {
        return this.candles.filter((candle) => {
            const matchesSymbol = candle.symbol === query.symbol;
            const matchesTimeframe = candle.timeframe === query.timeframe;
            const matchesType = query.type ? candle.type === query.type : true;
            return matchesSymbol && matchesTimeframe && matchesType;
        });
    }
    generateHeikenAshi(symbol, timeframe) {
        const normalCandles = this.candles.filter((candle) => candle.symbol === symbol &&
            candle.timeframe === timeframe &&
            candle.type === create_candle_dto_1.CandleType.CANDLESTICK);
        const heikenAshi = [];
        for (let i = 0; i < normalCandles.length; i++) {
            const current = normalCandles[i];
            const previousHA = heikenAshi[i - 1];
            const close = (current.open + current.high + current.low + current.close) / 4;
            const open = previousHA
                ? (previousHA.open + previousHA.close) / 2
                : (current.open + current.close) / 2;
            const high = Math.max(current.high, open, close);
            const low = Math.min(current.low, open, close);
            heikenAshi.push({
                id: crypto.randomUUID(),
                symbol,
                timeframe,
                type: create_candle_dto_1.CandleType.HEIKEN_ASHI,
                open,
                high,
                low,
                close,
                volume: current.volume,
                openedAt: current.openedAt,
                closedAt: current.closedAt,
            });
        }
        return heikenAshi;
    }
};
exports.CandlesService = CandlesService;
exports.CandlesService = CandlesService = __decorate([
    (0, common_1.Injectable)()
], CandlesService);
//# sourceMappingURL=candles.service.js.map