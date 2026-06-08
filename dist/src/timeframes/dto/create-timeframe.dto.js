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
exports.CreateTimeframeDto = exports.TimeframeCode = void 0;
const class_validator_1 = require("class-validator");
var TimeframeCode;
(function (TimeframeCode) {
    TimeframeCode["S5"] = "S5";
    TimeframeCode["S10"] = "S10";
    TimeframeCode["S15"] = "S15";
    TimeframeCode["S30"] = "S30";
    TimeframeCode["M1"] = "M1";
    TimeframeCode["M2"] = "M2";
    TimeframeCode["M3"] = "M3";
    TimeframeCode["M5"] = "M5";
    TimeframeCode["M10"] = "M10";
    TimeframeCode["M15"] = "M15";
    TimeframeCode["M30"] = "M30";
    TimeframeCode["H1"] = "H1";
    TimeframeCode["H4"] = "H4";
    TimeframeCode["D1"] = "D1";
})(TimeframeCode || (exports.TimeframeCode = TimeframeCode = {}));
class CreateTimeframeDto {
}
exports.CreateTimeframeDto = CreateTimeframeDto;
__decorate([
    (0, class_validator_1.IsEnum)(TimeframeCode),
    __metadata("design:type", String)
], CreateTimeframeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTimeframeDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-timeframe.dto.js.map