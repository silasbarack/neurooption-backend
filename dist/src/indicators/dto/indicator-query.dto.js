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
const class_validator_1 = require("class-validator");
var IndicatorType;
(function (IndicatorType) {
    IndicatorType["SMA"] = "SMA";
    IndicatorType["EMA"] = "EMA";
    IndicatorType["WMA"] = "WMA";
    IndicatorType["RSI"] = "RSI";
    IndicatorType["MACD"] = "MACD";
    IndicatorType["BOLLINGER_BANDS"] = "BOLLINGER_BANDS";
    IndicatorType["STOCHASTIC"] = "STOCHASTIC";
    IndicatorType["ATR"] = "ATR";
    IndicatorType["ADX"] = "ADX";
    IndicatorType["CCI"] = "CCI";
    IndicatorType["MOMENTUM"] = "MOMENTUM";
    IndicatorType["ROC"] = "ROC";
    IndicatorType["WILLIAMS_R"] = "WILLIAMS_R";
    IndicatorType["PARABOLIC_SAR"] = "PARABOLIC_SAR";
    IndicatorType["ICHIMOKU"] = "ICHIMOKU";
    IndicatorType["VWAP"] = "VWAP";
    IndicatorType["OBV"] = "OBV";
    IndicatorType["MFI"] = "MFI";
    IndicatorType["PIVOT_POINTS"] = "PIVOT_POINTS";
    IndicatorType["SUPERTREND"] = "SUPERTREND";
    IndicatorType["DONCHIAN_CHANNEL"] = "DONCHIAN_CHANNEL";
    IndicatorType["KELTNER_CHANNEL"] = "KELTNER_CHANNEL";
    IndicatorType["STANDARD_DEVIATION"] = "STANDARD_DEVIATION";
    IndicatorType["ZIGZAG"] = "ZIGZAG";
    IndicatorType["DEMA"] = "DEMA";
    IndicatorType["TEMA"] = "TEMA";
    IndicatorType["TRIX"] = "TRIX";
    IndicatorType["AROON"] = "AROON";
    IndicatorType["CHAIKIN_OSCILLATOR"] = "CHAIKIN_OSCILLATOR";
    IndicatorType["VOLUME_OSCILLATOR"] = "VOLUME_OSCILLATOR";
    IndicatorType["ALLIGATOR"] = "ALLIGATOR";
    IndicatorType["FRACTALS"] = "FRACTALS";
    IndicatorType["AWESOME_OSCILLATOR"] = "AWESOME_OSCILLATOR";
    IndicatorType["ACCELERATOR_OSCILLATOR"] = "ACCELERATOR_OSCILLATOR";
    IndicatorType["ENVELOPES"] = "ENVELOPES";
    IndicatorType["GATOR_OSCILLATOR"] = "GATOR_OSCILLATOR";
    IndicatorType["DEMARKER"] = "DEMARKER";
    IndicatorType["RVI"] = "RVI";
    IndicatorType["ELDER_RAY"] = "ELDER_RAY";
    IndicatorType["FORCE_INDEX"] = "FORCE_INDEX";
    IndicatorType["BULLS_POWER"] = "BULLS_POWER";
    IndicatorType["BEARS_POWER"] = "BEARS_POWER";
})(IndicatorType || (exports.IndicatorType = IndicatorType = {}));
class IndicatorQueryDto {
}
exports.IndicatorQueryDto = IndicatorQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "timeframe", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(IndicatorType),
    __metadata("design:type", String)
], IndicatorQueryDto.prototype, "indicator", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], IndicatorQueryDto.prototype, "period", void 0);
//# sourceMappingURL=indicator-query.dto.js.map