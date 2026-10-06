import { NormalizedMarketTick } from './market-tick.types';

export interface MarketDataProviderAdapter {
  readonly source: string;
  readonly marketType: 'REAL' | 'OTC';

  connect(): Promise<void> | void;
  disconnect(): Promise<void> | void;
  subscribe(symbols: string[]): Promise<void> | void;
  unsubscribe(symbols: string[]): Promise<void> | void;
  onTick(handler: (tick: Omit<NormalizedMarketTick, 'sequence' | 'serverReceiveTimestamp'>) => void): void;
  isHealthy(): boolean;
}

/**
 * Real-market adapters must implement this contract and emit genuine provider
 * bid/ask ticks. NeuroOption must never fall back to the OTC simulator for a
 * symbol configured as REAL.
 */
export abstract class RealMarketDataProviderAdapter
  implements MarketDataProviderAdapter
{
  abstract readonly source: string;
  readonly marketType = 'REAL' as const;

  abstract connect(): Promise<void> | void;
  abstract disconnect(): Promise<void> | void;
  abstract subscribe(symbols: string[]): Promise<void> | void;
  abstract unsubscribe(symbols: string[]): Promise<void> | void;
  abstract onTick(
    handler: (
      tick: Omit<
        NormalizedMarketTick,
        'sequence' | 'serverReceiveTimestamp'
      >,
    ) => void,
  ): void;
  abstract isHealthy(): boolean;
}
