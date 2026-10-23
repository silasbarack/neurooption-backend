import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signal } from './signal.entity';
import { MarketDataService } from '../market-data/market-data.service';

const CALL_REASONS = [
  'RSI recovering from oversold zone (28→42)',
  'EMA20 crossed above EMA50 — bullish crossover',
  'Price bounced off key support level',
  'Bullish engulfing pattern detected',
  'MACD histogram turning positive',
  'Stochastic oversold reversal confirmed',
  'Fibonacci 61.8% retracement support held',
  'Volume increasing on upside move',
];

const PUT_REASONS = [
  'Bearish divergence on RSI — reversal signal',
  'Price rejected at strong resistance zone',
  'EMA20 crossed below EMA50 — bearish signal',
  'Overbought RSI (>72) with weakening momentum',
  'Shooting star candle at resistance level',
  'MACD bearish crossover confirmed',
  'Double top pattern formed at resistance',
  'Volume declining on rally — distribution',
];

@Injectable()
export class SignalsService implements OnModuleInit {
  constructor(
    @InjectRepository(Signal) private signalRepo: Repository<Signal>,
    private marketDataService: MarketDataService,
  ) {}

  onModuleInit() {
    this.generateSignals();
    setInterval(() => this.generateSignals(), 30000);
  }

  private async generateSignals() {
    const assets = this.marketDataService.getAllAssets();
    const topAssets = assets.slice(0, 10);
    for (const asset of topAssets) {
      const price = this.marketDataService.getCurrentPrice(asset.id);
      const direction = Math.random() > 0.45 ? 'CALL' : 'PUT';
      const confidence = Math.floor(Math.random() * 25 + 68);
      const reasons = direction === 'CALL' ? CALL_REASONS : PUT_REASONS;
      const picked = reasons.sort(() => Math.random() - 0.5).slice(0, 3);
      const duration = [60, 120, 300, 900][Math.floor(Math.random() * 4)];
      const signal = this.signalRepo.create({
        assetId: asset.id, assetName: asset.name,
        direction: direction as 'CALL' | 'PUT', confidence, timeframe: '1m', durationSeconds: duration,
        signalPrice: price, reasons: picked, isActive: true, expiresAt: new Date(Date.now() + duration * 1000),
        indicators: { rsi: Math.random() * 100, macd: (Math.random() - 0.5) * 0.002, ema20: price, ema50: price * (1 + (Math.random() - 0.5) * 0.01) },
      });
      await this.signalRepo.save(signal);
    }
  }

  async getActiveSignals() {
    return this.signalRepo.find({ where: { isActive: true }, order: { confidence: 'DESC' }, take: 20 });
  }

  async getSignalForAsset(assetId: string) {
    const price = this.marketDataService.getCurrentPrice(assetId);
    const asset = this.marketDataService.getAsset(assetId);
    const direction = Math.random() > 0.45 ? 'CALL' : 'PUT';
    const confidence = Math.floor(Math.random() * 25 + 68);
    const reasons = direction === 'CALL' ? CALL_REASONS : PUT_REASONS;
    return {
      assetId, assetName: asset?.name, direction, confidence,
      signalPrice: price, reasons: reasons.sort(() => Math.random() - 0.5).slice(0, 3),
      generatedAt: new Date(),
    };
  }
}
