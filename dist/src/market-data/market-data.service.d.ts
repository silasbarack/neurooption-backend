import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { OtcEngineService } from './otc-engine.service';
import { GetCandlesDto } from './dto/get-candles.dto';
export declare class MarketDataService implements OnModuleInit {
    private readonly prisma;
    private readonly otcEngine;
    private assetsReady;
    constructor(prisma: PrismaService, otcEngine: OtcEngineService);
    onModuleInit(): Promise<void>;
    getAssets(): Promise<{
        assets: {
            symbol: string;
            label: string;
            category: string;
            basePrice: number;
            precision: number;
            payoutBoost: number;
            isActive: boolean;
        }[];
    }>;
    getCandles(query: GetCandlesDto): Promise<{
        asset: {
            symbol: string;
            label: string;
            category: string;
            basePrice: number;
            precision: number;
            payoutBoost: number;
        };
        timeframe: string;
        serverTime: string;
        candles: {
            open: number;
            high: number;
            low: number;
            close: number;
            time: number;
            openTime: string;
            closeTime: string;
        }[];
    }>;
    private ensureAssets;
    private catchUpCandles;
    private seedInitialCandles;
    private upsertCandle;
    private getSeedAsset;
    private floorToMinute;
    private getCurrentCandleProgress;
    private parseLimit;
}
