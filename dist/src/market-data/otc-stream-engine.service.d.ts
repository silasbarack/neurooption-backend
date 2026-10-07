import { NormalizedMarketTick } from './market-tick.types';
export declare class OtcStreamEngineService {
    private readonly states;
    isDue(symbol: string, now?: number): boolean;
    private decisionDue;
    nextTick(symbol: string, now?: number): Omit<NormalizedMarketTick, 'serverReceiveTimestamp'>;
    private decide;
    getLatestTick(symbol: string, now?: number): Omit<NormalizedMarketTick, "serverReceiveTimestamp">;
    private getState;
    private transitionRegime;
    private planQuoteMove;
    private drawMoveSize;
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
