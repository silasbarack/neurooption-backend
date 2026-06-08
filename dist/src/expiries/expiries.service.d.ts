import { CreateExpiryDto } from './dto/create-expiry.dto';
import { UpdateExpiryDto } from './dto/update-expiry.dto';
export declare class ExpiriesService {
    private expiries;
    create(dto: CreateExpiryDto): {
        isActive: boolean;
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
    };
    findAll(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
        isActive: boolean;
    }[];
    findActive(): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
        isActive: boolean;
    }[];
    findOne(duration: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    update(duration: string, dto: UpdateExpiryDto): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    remove(duration: string): {
        id: `${string}-${string}-${string}-${string}-${string}`;
        duration: string;
        seconds: number;
        label: string;
        isActive: boolean;
    };
    private buildExpiry;
    private toSeconds;
    private toLabel;
}
