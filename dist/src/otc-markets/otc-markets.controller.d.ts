import { CreateOtcSymbolDto } from './dto/create-otc-symbol.dto';
import { UpdateOtcSymbolDto } from './dto/update-otc-symbol.dto';
import { OtcMarketsService } from './otc-markets.service';
export declare class OtcMarketsController {
    private readonly otcMarketsService;
    constructor(otcMarketsService: OtcMarketsService);
    create(dto: CreateOtcSymbolDto): {
        isActive: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        createdAt: Date;
    };
    findAll(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    }[];
    findActive(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    }[];
    findOne(symbol: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
    update(symbol: string, dto: UpdateOtcSymbolDto): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
    remove(symbol: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
}
