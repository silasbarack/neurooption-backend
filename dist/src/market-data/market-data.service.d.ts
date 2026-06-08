import { PriceFeedDto } from './dto/price-feed.dto';
export declare class MarketDataService {
    private prices;
    findAll(): any[];
    findBySymbol(symbol: string): any;
    findByMarketType(marketType: 'OTC' | 'REAL'): any[];
    updatePrice(dto: PriceFeedDto): any;
    getCurrentMidPrice(symbol: string): number;
    private buildPrice;
}
