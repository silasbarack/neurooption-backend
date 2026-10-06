import { NormalizedMarketTick } from './market-tick.types';
export declare class OtcStreamEngineService {
    private readonly states;
    nextTick(symbol: string, now?: number): Omit<NormalizedMarketTick, 'serverReceiveTimestamp'>;
    getLatestTick(symbol: string, now?: number): Omit<NormalizedMarketTick, "serverReceiveTimestamp">;
    private getState;
    private transitionRegime;
    private nextQuotePrice;
    private drawMicroStepSize;
    private transitionMicroRegime;
    private regimeDrift;
    private regimePersistence;
    private regimeVolatilityMultiplier;
    private baseTickVolatility;
    private maxTickLogReturn;
    private baseSpread;
    private findAsset;
    private hashString;
    private nextRandom;
    private randomNormal;
    private roundToTick;
    private clamp;
}
