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
exports.IndicatorQueryDto = exports.IndicatorType = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const indicators_constants_1 = require("../indicators.constants");
var indicators_constants_2 = require("../indicators.constants");
Object.defineProperty(exports, "IndicatorType", { enumerable: true, get: function () { return indicators_constants_2.IndicatorType; } });
class IndicatorQueryDto {
}
exports.IndicatorQueryDto = IndicatorQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "asset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(indicators_constants_1.IndicatorType),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "indicator", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], IndicatorQueryDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], IndicatorQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=indicator-result.dto.js.map