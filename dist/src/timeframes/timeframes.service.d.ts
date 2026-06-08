import { CreateTimeframeDto, TimeframeCode } from './dto/create-timeframe.dto';
import { UpdateTimeframeDto } from './dto/update-timeframe.dto';
export declare class TimeframesService {
    private timeframes;
    create(dto: CreateTimeframeDto): {
        isActive: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
    };
    findAll(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
        isActive: boolean;
    }[];
    findActive(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
        isActive: boolean;
    }[];
    findOne(code: TimeframeCode): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    update(code: TimeframeCode, dto: UpdateTimeframeDto): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    remove(code: TimeframeCode): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        code: TimeframeCode;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    private buildTimeframe;
    private toSeconds;
    private toLabel;
}
