import { SeedAsset } from './market-data.constants';
export type GeneratedCandle = {
    open: number;
    high: number;
    low: number;
    close: number;
    openTime: Date;
    closeTime: Date;
};
export declare class OtcEngineService {
    generateCandle(asset: SeedAsset, previousClose: number, openTime: Date, progress?: number): GeneratedCandle;
    private getBaseVolatility;
    private getRegime;
    private getRegimeDrift;
    private getFairValue;
    private hashString;
    private nextRandom;
    private randomBetween;
    private randomNormal;
    private roundPrice;
    private clamp;
}
