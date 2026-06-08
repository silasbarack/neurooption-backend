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
exports.CreateTradeDto = exports.MarketType = exports.TradeDirection = void 0;
const class_validator_1 = require("class-validator");
var TradeDirection;
(function (TradeDirection) {
    TradeDirection["BUY"] = "BUY";
    TradeDirection["SELL"] = "SELL";
})(TradeDirection || (exports.TradeDirection = TradeDirection = {}));
var MarketType;
(function (MarketType) {
    MarketType["OTC"] = "OTC";
    MarketType["REAL"] = "REAL";
})(MarketType || (exports.MarketType = MarketType = {}));
class CreateTradeDto {
}
exports.CreateTradeDto = CreateTradeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TradeDirection),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTradeDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "expiry", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(MarketType),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "marketType", void 0);
//# sourceMappingURL=create-trade.dto.js.map