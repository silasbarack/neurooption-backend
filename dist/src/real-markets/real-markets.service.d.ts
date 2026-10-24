import { CreateRealSymbolDto } from './dto/create-real-symbol.dto';
import { UpdateRealSymbolDto } from './dto/update-real-symbol.dto';
export declare class RealMarketsService {
    private symbols;
    create(dto: CreateRealSymbolDto): {
        isActive: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        createdAt: Date;
    };
    findAll(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    }[];
    findActive(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    }[];
    findOne(symbol: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
    update(symbol: string, dto: UpdateRealSymbolDto): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
    remove(symbol: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        symbol: string;
        displayName: string;
        source: string;
        marketType: string;
        isActive: boolean;
        createdAt: Date;
    };
    private buildSymbol;
}
