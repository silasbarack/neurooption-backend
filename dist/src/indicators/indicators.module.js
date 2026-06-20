"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndicatorsModule = void 0;
const common_1 = require("@nestjs/common");
const candles_module_1 = require("../candles/candles.module");
const market_data_module_1 = require("../market-data/market-data.module");
const indicators_calculator_service_1 = require("./indicators-calculator.service");
const indicators_controller_1 = require("./indicators.controller");
const indicators_service_1 = require("./indicators.service");
let IndicatorsModule = class IndicatorsModule {
};
exports.IndicatorsModule = IndicatorsModule;
exports.IndicatorsModule = IndicatorsModule = __decorate([
    (0, common_1.Module)({
        imports: [candles_module_1.CandlesModule, market_data_module_1.MarketDataModule],
        controllers: [indicators_controller_1.IndicatorsController],
        providers: [indicators_service_1.IndicatorsService, indicators_calculator_service_1.IndicatorsCalculatorService],
        exports: [indicators_service_1.IndicatorsService, indicators_calculator_service_1.IndicatorsCalculatorService],
    })
], IndicatorsModule);
//# sourceMappingURL=indicators.module.js.map