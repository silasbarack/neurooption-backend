"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartsService = void 0;
const common_1 = require("@nestjs/common");
const candles_service_1 = require("../candles/candles.service");
const chart_type_dto_1 = require("./dto/chart-type.dto");
const create_candle_dto_1 = require("../candles/dto/create-candle.dto");
let ChartsService = class ChartsService {
    constructor(candlesService) {
        this.candlesService = candlesService;
    }
    getChartData(query) {
        if (query.chartType === chart_type_dto_1.ChartType.HEIKEN_ASHI) {
            return this.candlesService.generateHeikenAshi(query.symbol, query.timeframe);
        }
        const candleType = query.chartType === chart_type_dto_1.ChartType.CANDLESTICK
            ? create_candle_dto_1.CandleType.CANDLESTICK
            : query.chartType === chart_type_dto_1.ChartType.BAR
                ? create_candle_dto_1.CandleType.BAR
                : create_candle_dto_1.CandleType.LINE;
        return this.candlesService.findByQuery({
            symbol: query.symbol,
            timeframe: query.timeframe,
            type: candleType,
        });
    }
};
exports.ChartsService = ChartsService;
exports.ChartsService = ChartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [candles_service_1.CandlesService])
], ChartsService);
//# sourceMappingURL=charts.service.js.map