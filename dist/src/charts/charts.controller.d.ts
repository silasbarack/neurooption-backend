import { ChartsService } from './charts.service';
import { ChartQueryDto } from './dto/chart-query.dto';
export declare class ChartsController {
    private readonly chartsService;
    constructor(chartsService: ChartsService);
    getChartData(query: ChartQueryDto): any[];
}
