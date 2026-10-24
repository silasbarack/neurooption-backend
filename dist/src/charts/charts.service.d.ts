import { CandlesService } from '../candles/candles.service';
import { ChartQueryDto } from './dto/chart-query.dto';
export declare class ChartsService {
    private readonly candlesService;
    constructor(candlesService: CandlesService);
    getChartData(query: ChartQueryDto): any[];
}
