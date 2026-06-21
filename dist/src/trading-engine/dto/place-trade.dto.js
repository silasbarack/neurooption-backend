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
exports.PlaceTradeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const trading_engine_types_1 = require("../trading-engine.types");
const market_data_constants_1 = require("../../market-data/market-data.constants");
class PlaceTradeDto {
    constructor() {
        this.userId = 'demo-user';
        this.timeframe = 'M1';
        this.accountType = 'QT Demo';
        this.currency = 'USD';
    }
}
exports.PlaceTradeDto = PlaceTradeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "asset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(market_data_constants_1.SUPPORTED_TIMEFRAMES),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['BUY', 'SELL']),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "side", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(trading_engine_types_1.ACCOUNT_TYPES),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "accountType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(trading_engine_types_1.ACCOUNT_CURRENCIES),
    __metadata("design:type", String)
], PlaceTradeDto.prototype, "currency", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PlaceTradeDto.prototype, "amount", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(18000),
    __metadata("design:type", Number)
], PlaceTradeDto.prototype, "expirySeconds", void 0);
//# sourceMappingURL=place-trade.dto.js.map