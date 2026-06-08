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
exports.CandleUpdateDto = exports.CandleType = void 0;
const class_validator_1 = require("class-validator");
var CandleType;
(function (CandleType) {
    CandleType["CANDLESTICK"] = "CANDLESTICK";
    CandleType["HEIKEN_ASHI"] = "HEIKEN_ASHI";
    CandleType["BAR"] = "BAR";
    CandleType["LINE"] = "LINE";
})(CandleType || (exports.CandleType = CandleType = {}));
class CandleUpdateDto {
}
exports.CandleUpdateDto = CandleUpdateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CandleUpdateDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CandleUpdateDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CandleType),
    __metadata("design:type", String)
], CandleUpdateDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CandleUpdateDto.prototype, "open", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CandleUpdateDto.prototype, "high", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CandleUpdateDto.prototype, "low", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CandleUpdateDto.prototype, "close", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CandleUpdateDto.prototype, "volume", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CandleUpdateDto.prototype, "openedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CandleUpdateDto.prototype, "closedAt", void 0);
//# sourceMappingURL=candle-update.dto.js.map