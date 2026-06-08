import { Controller, Get, Query } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartQueryDto } from './dto/chart-query.dto';

@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get()
  getChartData(@Query() query: ChartQueryDto) {
    return this.chartsService.getChartData(query);
  }
}