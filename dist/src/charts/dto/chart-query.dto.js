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
exports.ChartQueryDto = void 0;
const class_validator_1 = require("class-validator");
const chart_type_dto_1 = require("./chart-type.dto");
class ChartQueryDto {
}
exports.ChartQueryDto = ChartQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChartQueryDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChartQueryDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(chart_type_dto_1.ChartType),
    __metadata("design:type", String)
], ChartQueryDto.prototype, "chartType", void 0);
//# sourceMappingURL=chart-query.dto.js.map