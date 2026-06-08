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
exports.CandlesController = void 0;
const common_1 = require("@nestjs/common");
const candles_service_1 = require("./candles.service");
const create_candle_dto_1 = require("./dto/create-candle.dto");
const candle_query_dto_1 = require("./dto/candle-query.dto");
let CandlesController = class CandlesController {
    constructor(candlesService) {
        this.candlesService = candlesService;
    }
    create(dto) {
        return this.candlesService.create(dto);
    }
    findAll() {
        return this.candlesService.findAll();
    }
    findByQuery(query) {
        return this.candlesService.findByQuery(query);
    }
    generateHeikenAshi(symbol, timeframe) {
        return this.candlesService.generateHeikenAshi(symbol, timeframe);
    }
};
exports.CandlesController = CandlesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_candle_dto_1.CreateCandleDto]),
    __metadata("design:returntype", void 0)
], CandlesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CandlesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('query'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [candle_query_dto_1.CandleQueryDto]),
    __metadata("design:returntype", void 0)
], CandlesController.prototype, "findByQuery", null);
__decorate([
    (0, common_1.Get)('heiken-ashi'),
    __param(0, (0, common_1.Query)('symbol')),
    __param(1, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CandlesController.prototype, "generateHeikenAshi", null);
exports.CandlesController = CandlesController = __decorate([
    (0, common_1.Controller)('candles'),
    __metadata("design:paramtypes", [candles_service_1.CandlesService])
], CandlesController);
//# sourceMappingURL=candles.controller.js.map