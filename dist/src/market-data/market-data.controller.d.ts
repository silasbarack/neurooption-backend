import { MarketDataService } from './market-data.service';
import { PriceFeedDto } from './dto/price-feed.dto';
export declare class MarketDataController {
    private readonly marketDataService;
    constructor(marketDataService: MarketDataService);
    findAll(): any[];
    findBySymbol(symbol: string): any;
    findByMarketType(marketType: 'OTC' | 'REAL'): any[];
    updatePrice(dto: PriceFeedDto): any;
}
