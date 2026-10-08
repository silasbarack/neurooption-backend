import { NormalizedMarketTick } from './market-tick.types';
export type OtcRegimeStats = {
    decisions: number;
    stressed: number;
    trending: number;
    current: string | null;
};
export declare class OtcStreamEngineService {
    private readonly states;
    isDue(symbol: string, now?: number): boolean;
    private decisionDue;
    isDecisionDue(symbol: string, now?: number): boolean;
    nextTick(symbol: string, now?: number): Omit<NormalizedMarketTick, 'serverReceiveTimestamp'>;
    nextStreamTick(symbol: string, now?: number): Omit<NormalizedMarketTick, 'serverReceiveTimestamp'> | null;
    private advance;
    private emitTick;
    private decide;
    drainRegimeStats(symbol: string): OtcRegimeStats;
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
