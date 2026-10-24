import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketTickQueryDto } from './dto/market-tick-query.dto';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { PayoutEngineService } from '../payout-engine/payout-engine.service';

@Controller('market-data')
export class MarketDataController {
  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly latencyMetrics: LatencyMetricsService,
    private readonly payoutEngine: PayoutEngineService,
  ) {}

  @Get('payouts')
  getPayouts() {
    return this.marketDataService.getPayouts();
  }

  /** Current quote for one asset and expiry (what a trade would be accepted at). */
  @Get('payouts/quote')
  getPayoutQuote(@Query('asset') asset: string, @Query('expirySeconds') expirySeconds?: string) {
    const seconds = Number(expirySeconds ?? 60);
    const quote = this.payoutEngine.quote(String(asset ?? ''), Number.isFinite(seconds) ? seconds : 60);
    if (!quote) throw new NotFoundException('Unknown asset.');
    return quote;
  }

  /** Measured conditions, target and smoothing state behind an asset's payout. */
  @Get('payouts/diagnostics')
  getPayoutDiagnostics(@Query('asset') asset: string) {
    const diagnostics = this.payoutEngine.getDiagnostics(String(asset ?? ''));
    if (!diagnostics) throw new NotFoundException('Unknown asset.');
    return diagnostics;
  }

  /** Audit trail of published payout changes for an asset. */
  @Get('payouts/history')
  async getPayoutHistory(@Query('asset') asset: string, @Query('limit') limit?: string) {
    if (!this.payoutEngine.getSnapshot(String(asset ?? ''))) {
      throw new NotFoundException('Unknown asset.');
    }
    return {
      asset,
      history: await this.payoutEngine.getHistory(String(asset), Number(limit) || 50),
    };
  }

  @Get('assets')
  getAssets() {
    return this.marketDataService.getAssets();
  }

  @Get('quotes')
  getQuotes() {
    return this.marketDataService.getQuotes();
  }

  @Get('candles')
  getCandles(@Query() query: MarketCandlesQueryDto) {
    return this.marketDataService.getCandles(query);
  }

  @Get('tick')
  getTick(@Query() query: MarketTickQueryDto) {
    return this.marketDataService.getTick(query.asset);
  }

  @Get('metrics')
  getMetrics() {
    return this.latencyMetrics.snapshot();
  }
}
