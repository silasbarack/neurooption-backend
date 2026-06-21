import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MARKET_ASSETS,
  MarketAsset,
  OtcCandle,
  TIMEFRAME_SECONDS,
} from './market-data.constants';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';

type OtcTick = {
  asset: string;
  price: number;
  time: number;
  serverTime: string;
};

@Injectable()
export class MarketDataService {
  getAssets() {
    return {
      serverTime: new Date().toISOString(),
      categories: this.getCategories(),
      assets: MARKET_ASSETS.filter((asset) => asset.isActive).map((asset) => ({
        symbol: asset.symbol,
        label: asset.label,
        category: asset.category,
        basePrice: asset.basePrice,
        precision: asset.precision,
        payoutBoost: asset.payoutBoost,
        isActive: asset.isActive,
      })),
    };
  }

  getCategories() {
    return Array.from(new Set(MARKET_ASSETS.map((asset) => asset.category)));
  }

  getTick(assetSymbol: string): OtcTick {
    const asset = this.findAsset(assetSymbol);
    const now = Date.now();
    const price = this.roundPrice(this.priceAt(asset, now), asset.precision);

    return {
      asset: asset.symbol,
      price,
      time: now,
      serverTime: new Date(now).toISOString(),
    };
  }

  getCandles(query: MarketCandlesQueryDto) {
    const asset = this.findAsset(query.asset);
    const timeframe = this.normalizeTimeframe(query.timeframe);
    const timeframeSeconds = TIMEFRAME_SECONDS[timeframe];
    const intervalMs = timeframeSeconds * 1000;
    const limit = this.normalizeLimit(query.limit, timeframeSeconds);

    const now = Date.now();
    const currentCandleStart = Math.floor(now / intervalMs) * intervalMs;
    const firstStart = currentCandleStart - intervalMs * (limit - 1);

    const candles: OtcCandle[] = [];

    for (let index = 0; index < limit; index += 1) {
      const candleStart = firstStart + index * intervalMs;

      candles.push(
        this.buildCanonicalCandle(asset, timeframe, candleStart, now),
      );
    }

    return {
      asset: {
        symbol: asset.symbol,
        label: asset.label,
        category: asset.category,
        basePrice: asset.basePrice,
        precision: asset.precision,
        payoutBoost: asset.payoutBoost,
        isActive: asset.isActive,
      },
      timeframe,
      timeframeSeconds,
      serverTime: new Date(now).toISOString(),
      candles,
    };
  }

  private buildCanonicalCandle(
    asset: MarketAsset,
    timeframe: string,
    candleStart: number,
    now: number,
  ): OtcCandle {
    const timeframeSeconds = TIMEFRAME_SECONDS[timeframe];
    const intervalMs = timeframeSeconds * 1000;
    const candleEnd = candleStart + intervalMs;
    const effectiveEnd = Math.min(candleEnd, now);

    const open = this.priceAt(asset, candleStart);
    const close = this.priceAt(asset, effectiveEnd);

    const prices: number[] = [open, close];

    const sampleStepMs = this.getCanonicalSampleStepMs(timeframeSeconds);

    for (
      let sampleTime = candleStart + sampleStepMs;
      sampleTime < effectiveEnd;
      sampleTime += sampleStepMs
    ) {
      prices.push(this.priceAt(asset, sampleTime));
    }

    const bodyHigh = Math.max(...prices);
    const bodyLow = Math.min(...prices);

    const wick = this.buildRealisticWick(
      asset,
      timeframe,
      candleStart,
      bodyHigh,
      bodyLow,
    );

    return {
      time: candleStart,
      openTime: new Date(candleStart).toISOString(),
      closeTime: new Date(candleEnd).toISOString(),
      open: this.roundPrice(open, asset.precision),
      high: this.roundPrice(Math.max(bodyHigh, wick.high), asset.precision),
      low: this.roundPrice(Math.min(bodyLow, wick.low), asset.precision),
      close: this.roundPrice(close, asset.precision),
      volume: this.buildTickVolume(asset, timeframe, candleStart),
    };
  }

  private priceAt(asset: MarketAsset, timeMs: number): number {
    const seed = this.assetSeed(asset.symbol);
    const seconds = timeMs / 1000;

    const slowStructure =
      Math.sin(seconds / (1400 + (seed % 300)) + seed * 0.003) *
      asset.volatility *
      1.35;

    const mediumStructure =
      Math.sin(seconds / (390 + (seed % 95)) + seed * 0.011) *
      asset.volatility *
      0.85;

    const shortStructure =
      Math.sin(seconds / (72 + (seed % 21)) + seed * 0.021) *
      asset.volatility *
      0.42;

    const microMovement =
      this.smoothNoise(asset.symbol, Math.floor(timeMs / 2500), 0.4) *
      asset.volatility *
      0.22;

    const sessionPressure =
      this.sessionVolatilityMultiplier(timeMs) * asset.volatility * 0.16;

    const totalMove =
      slowStructure +
      mediumStructure +
      shortStructure +
      microMovement +
      sessionPressure;

    const price = asset.basePrice * (1 + totalMove);

    return Math.max(price, asset.basePrice * 0.05);
  }

  private getCanonicalSampleStepMs(timeframeSeconds: number) {
    if (timeframeSeconds <= 5) return 1000;
    if (timeframeSeconds <= 15) return 2500;
    if (timeframeSeconds <= 30) return 5000;
    if (timeframeSeconds <= 60) return 5000;
    if (timeframeSeconds <= 180) return 10000;
    if (timeframeSeconds <= 300) return 15000;
    if (timeframeSeconds <= 900) return 30000;
    if (timeframeSeconds <= 1800) return 60000;
    if (timeframeSeconds <= 3600) return 120000;

    return 300000;
  }

  private buildRealisticWick(
    asset: MarketAsset,
    timeframe: string,
    candleStart: number,
    bodyHigh: number,
    bodyLow: number,
  ) {
    const timeframeSeconds = TIMEFRAME_SECONDS[timeframe];
    const bodyRange = Math.max(bodyHigh - bodyLow, asset.basePrice * 0.00002);
    const timeframeWeight = Math.sqrt(Math.max(timeframeSeconds, 5) / 60);

    const upperRandom = this.seededRandom(
      `${asset.symbol}:${timeframe}:${candleStart}:upper-wick`,
    );

    const lowerRandom = this.seededRandom(
      `${asset.symbol}:${timeframe}:${candleStart}:lower-wick`,
    );

    const maxWick =
      bodyRange * (0.12 + timeframeWeight * 0.08) +
      asset.basePrice * asset.volatility * 0.01;

    return {
      high: bodyHigh + maxWick * upperRandom,
      low: bodyLow - maxWick * lowerRandom,
    };
  }

  private buildTickVolume(
    asset: MarketAsset,
    timeframe: string,
    candleStart: number,
  ) {
    const timeframeSeconds = TIMEFRAME_SECONDS[timeframe];
    const base = Math.max(10, Math.floor(timeframeSeconds / 3));

    const random = this.seededRandom(
      `${asset.symbol}:${timeframe}:${candleStart}:volume`,
    );

    return Math.floor(base + random * base * 2.5);
  }

  private sessionVolatilityMultiplier(timeMs: number) {
    const utcHour = new Date(timeMs).getUTCHours();

    if (utcHour >= 7 && utcHour <= 11) return 0.18;
    if (utcHour >= 12 && utcHour <= 16) return 0.28;
    if (utcHour >= 17 && utcHour <= 21) return 0.2;
    if (utcHour >= 0 && utcHour <= 5) return -0.08;

    return 0.04;
  }

  private smoothNoise(key: string, bucket: number, smoothness: number) {
    const current = this.seededRandom(`${key}:${bucket}`);
    const next = this.seededRandom(`${key}:${bucket + 1}`);

    return (current * (1 - smoothness) + next * smoothness - 0.5) * 2;
  }

  private seededRandom(input: string) {
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash +=
        (hash << 1) +
        (hash << 4) +
        (hash << 7) +
        (hash << 8) +
        (hash << 24);
    }

    return Math.abs(hash >>> 0) / 4294967295;
  }

  private assetSeed(symbol: string) {
    return Math.floor(this.seededRandom(symbol) * 1000000);
  }

  private roundPrice(price: number, precision: number) {
    return Number(price.toFixed(precision));
  }

  private normalizeTimeframe(timeframe?: string) {
    const normalized = (timeframe || 'M1').toUpperCase();

    if (!TIMEFRAME_SECONDS[normalized]) {
      throw new BadRequestException(
        `Unsupported timeframe: ${timeframe}. Supported: ${Object.keys(
          TIMEFRAME_SECONDS,
        ).join(', ')}`,
      );
    }

    return normalized;
  }

  private normalizeLimit(limit: number | undefined, timeframeSeconds: number) {
    const requested = Number(limit || 180);

    let maxLimit = 500;

    if (timeframeSeconds >= 14400) maxLimit = 100;
    else if (timeframeSeconds >= 3600) maxLimit = 140;
    else if (timeframeSeconds >= 1800) maxLimit = 180;
    else if (timeframeSeconds >= 900) maxLimit = 220;
    else if (timeframeSeconds >= 300) maxLimit = 260;

    return Math.min(Math.max(requested, 20), maxLimit);
  }

  private findAsset(symbol: string) {
    const normalized = symbol.trim().toLowerCase();

    const asset = MARKET_ASSETS.find(
      (item) => item.symbol.toLowerCase() === normalized,
    );

    if (!asset) {
      throw new BadRequestException(`Unsupported asset: ${symbol}`);
    }

    if (!asset.isActive) {
      throw new BadRequestException(`Asset is not active: ${symbol}`);
    }

    return asset;
  }
}