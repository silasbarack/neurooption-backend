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
exports.SymbolQueryDto = exports.MarketType = void 0;
const class_validator_1 = require("class-validator");
var MarketType;
(function (MarketType) {
    MarketType["OTC"] = "OTC";
    MarketType["REAL"] = "REAL";
})(MarketType || (exports.MarketType = MarketType = {}));
class SymbolQueryDto {
}
exports.SymbolQueryDto = SymbolQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SymbolQueryDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(MarketType),
    __metadata("design:type", String)
], SymbolQueryDto.prototype, "marketType", void 0);
//# sourceMappingURL=symbol-query.dto.js.map