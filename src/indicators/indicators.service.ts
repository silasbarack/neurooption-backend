import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculateIndicatorDto } from './dto/calculate-indicator.dto';
import { IndicatorQueryDto } from './dto/indicator-query.dto';
import {
  INDICATOR_DEFAULTS,
  IndicatorPlacement,
  IndicatorType,
  normalizeIndicatorType,
} from './indicators.constants';
import { IndicatorsCalculatorService } from './indicators-calculator.service';

type IndicatorDefaultsMap = typeof INDICATOR_DEFAULTS;

@Injectable()
export class IndicatorsService {
  constructor(private readonly calculator: IndicatorsCalculatorService) {}

  listIndicators() {
    return this.getAllDefaults();
  }

  getAllDefaults() {
    const indicators = Object.values(IndicatorType) as IndicatorType[];

    return indicators
      .filter((indicator) => normalizeIndicatorType(indicator) === indicator)
      .filter((indicator) => Boolean(INDICATOR_DEFAULTS[indicator]))
      .map((indicator) => {
        const defaults = INDICATOR_DEFAULTS[indicator];

        return {
          name: indicator,
          label: defaults.label,
          placement: defaults.placement,
          category:
            defaults.placement === IndicatorPlacement.OVERLAY
              ? 'overlay'
              : 'bottom',
          defaultParams: defaults.params,
        };
      });
  }

  getBottomIndicators() {
    return this.getAllDefaults().filter(
      (indicator) => indicator.placement === IndicatorPlacement.BOTTOM,
    );
  }

  getOverlayIndicators() {
    return this.getAllDefaults().filter(
      (indicator) => indicator.placement === IndicatorPlacement.OVERLAY,
    );
  }

  calculateFromCandles(dto: CalculateIndicatorDto) {
    const indicator = normalizeIndicatorType(dto.indicator);
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

  calculate(query: IndicatorQueryDto) {
    const indicator = normalizeIndicatorType(query.indicator);
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
      message:
        'Use POST /indicators/calculate with OHLC candles to calculate this indicator.',
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

  private getDefaults(indicator: IndicatorType): IndicatorDefaultsMap[IndicatorType] {
    const defaults = INDICATOR_DEFAULTS[indicator];

    if (!defaults) {
      throw new BadRequestException(`Unsupported indicator: ${indicator}`);
    }

    return defaults;
  }
}