import { Controller, Get, Query } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { IndicatorQueryDto } from './dto/indicator-query.dto';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Get()
  listIndicators() {
    return this.indicatorsService.listIndicators();
  }

  @Get('calculate')
  calculate(@Query() query: IndicatorQueryDto) {
    return this.indicatorsService.calculate(query);
  }
}