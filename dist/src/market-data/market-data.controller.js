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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const market_data_service_1 = require("./market-data.service");
const VALID_TIMEFRAMES = ["M1", "M2", "M3", "M5", "M15", "M30", "H1", "H4"];
let MarketDataController = class MarketDataController {
    constructor(marketDataService) {
        this.marketDataService = marketDataService;
    }
    getAssets(category) {
        return {
            success: true,
            assets: this.marketDataService.getAssets(category),
        };
    }
    getCandles(symbol = "AUD/CAD OTC", timeframe = "M1", limit = "120") {
        return {
            success: true,
            symbol,
            timeframe: this.normalizeTimeframe(timeframe),
            candles: this.marketDataService.getCandles(symbol, this.normalizeTimeframe(timeframe), Number(limit) || 120),
        };
    }
    stream(symbol = "AUD/CAD OTC", timeframe = "M1") {
        return this.marketDataService.stream(symbol, this.normalizeTimeframe(timeframe));
    }
    normalizeTimeframe(value) {
        if (VALID_TIMEFRAMES.includes(value)) {
            return value;
        }
        return "M1";
    }
};
exports.MarketDataController = MarketDataController;
__decorate([
    (0, common_1.Get)("assets"),
    __param(0, (0, common_1.Query)("category")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)("candles"),
    __param(0, (0, common_1.Query)("symbol")),
    __param(1, (0, common_1.Query)("timeframe")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "getCandles", null);
__decorate([
    (0, common_1.Sse)("stream"),
    __param(0, (0, common_1.Query)("symbol")),
    __param(1, (0, common_1.Query)("timeframe")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", rxjs_1.Observable)
], MarketDataController.prototype, "stream", null);
exports.MarketDataController = MarketDataController = __decorate([
    (0, common_1.Controller)("market-data"),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService])
], MarketDataController);
//# sourceMappingURL=market-data.controller.js.map