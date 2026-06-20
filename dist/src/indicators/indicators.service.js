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
exports.IndicatorsService = void 0;
const common_1 = require("@nestjs/common");
const indicators_constants_1 = require("./indicators.constants");
const indicators_calculator_service_1 = require("./indicators-calculator.service");
let IndicatorsService = class IndicatorsService {
    constructor(calculator) {
        this.calculator = calculator;
    }
    listIndicators() {
        return this.getAllDefaults();
    }
    getAllDefaults() {
        const indicators = Object.values(indicators_constants_1.IndicatorType);
        return indicators
            .filter((indicator) => (0, indicators_constants_1.normalizeIndicatorType)(indicator) === indicator)
            .filter((indicator) => Boolean(indicators_constants_1.INDICATOR_DEFAULTS[indicator]))
            .map((indicator) => {
            const defaults = indicators_constants_1.INDICATOR_DEFAULTS[indicator];
            return {
                name: indicator,
                label: defaults.label,
                placement: defaults.placement,
                category: defaults.placement === indicators_constants_1.IndicatorPlacement.OVERLAY
                    ? 'overlay'
                    : 'bottom',
                defaultParams: defaults.params,
            };
        });
    }
    getBottomIndicators() {
        return this.getAllDefaults().filter((indicator) => indicator.placement === indicators_constants_1.IndicatorPlacement.BOTTOM);
    }
    getOverlayIndicators() {
        return this.getAllDefaults().filter((indicator) => indicator.placement === indicators_constants_1.IndicatorPlacement.OVERLAY);
    }
    calculateFromCandles(dto) {
        const indicator = (0, indicators_constants_1.normalizeIndicatorType)(dto.indicator);
        const defaults = this.getDefaults(indicator);
        const params = {
            ...defaults.params,
            ...(dto.params || {}),
        };
        const values = this.calculator.calculate(indicator, dto.candles, params);
        return {
            indicator,
            label: defaults.label,
            placement: defaults.placement,
            params,
            values,
            generatedAt: new Date(),
        };
    }
    calculate(query) {
        const indicator = (0, indicators_constants_1.normalizeIndicatorType)(query.indicator);
        const defaults = this.getDefaults(indicator);
        const params = {
            ...defaults.params,
            ...(query.period ? { period: query.period } : {}),
        };
        return {
            indicator,
            label: defaults.label,
            placement: defaults.placement,
            params,
            message: 'Use POST /indicators/calculate with OHLC candles to calculate this indicator.',
            exampleBody: {
                indicator,
                candles: [
                    {
                        time: Date.now() - 60000,
                        open: 1.0842,
                        high: 1.0851,
                        low: 1.0839,
                        close: 1.0848,
                    },
                    {
                        time: Date.now(),
                        open: 1.0848,
                        high: 1.0855,
                        low: 1.0841,
                        close: 1.0852,
                    },
                ],
                params,
            },
            generatedAt: new Date(),
        };
    }
    getDefaults(indicator) {
        const defaults = indicators_constants_1.INDICATOR_DEFAULTS[indicator];
        if (!defaults) {
            throw new common_1.BadRequestException(`Unsupported indicator: ${indicator}`);
        }
        return defaults;
    }
};
exports.IndicatorsService = IndicatorsService;
exports.IndicatorsService = IndicatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [indicators_calculator_service_1.IndicatorsCalculatorService])
], IndicatorsService);
//# sourceMappingURL=indicators.service.js.map