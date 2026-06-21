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
    const seconds = TIMEFRAME_SECONDS[timeframe];
    const intervalMs = seconds * 1000;
    const limit = this.normalizeLimit(query.limit);

    const now = Date.now();
    const currentCandleStart = Math.floor(now / intervalMs) * intervalMs;
    const firstStart = currentCandleStart - intervalMs * (limit - 1);

    const candles: OtcCandle[] = [];

    for (let index = 0; index < limit; index += 1) {
      const candleStart = firstStart + index * intervalMs;
      const candle = this.buildCandle(asset, timeframe, candleStart, now);

      candles.push(candle);
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
      timeframeSeconds: seconds,
      serverTime: new Date(now).toISOString(),
      candles,
    };
  }

  private buildCandle(
    asset: MarketAsset,
    timeframe: string,
    candleStart: number,
    now: number,
  ): OtcCandle {
    const seconds = TIMEFRAME_SECONDS[timeframe];
    const intervalMs = seconds * 1000;
    const candleEnd = candleStart + intervalMs;

    const effectiveEnd = Math.min(candleEnd, now);
    const open = this.priceAt(asset, candleStart);
    const close = this.priceAt(asset, effectiveEnd);

    const sampleCount = this.getSampleCount(seconds);
    const prices: number[] = [open, close];

    for (let index = 1; index < sampleCount; index += 1) {
      const ratio = index / sampleCount;
      const sampleTime = candleStart + Math.floor((effectiveEnd - candleStart) * ratio);

      if (sampleTime <= candleStart || sampleTime >= effectiveEnd) {
        continue;
      }

      prices.push(this.priceAt(asset, sampleTime));
    }

    const bodyHigh = Math.max(...prices);
    const bodyLow = Math.min(...prices);

    const wick = this.buildWick(asset, candleStart, timeframe, bodyHigh, bodyLow);
    const high = Math.max(bodyHigh, wick.high);
    const low = Math.min(bodyLow, wick.low);

    return {
      time: candleStart,
      openTime: new Date(candleStart).toISOString(),
      closeTime: new Date(candleEnd).toISOString(),
      open: this.roundPrice(open, asset.precision),
      high: this.roundPrice(high, asset.precision),
      low: this.roundPrice(low, asset.precision),
      close: this.roundPrice(close, asset.precision),
      volume: this.buildTickVolume(asset, candleStart, timeframe),
    };
  }

  private priceAt(asset: MarketAsset, timeMs: number): number {
    const seed = this.assetSeed(asset.symbol);
    const seconds = timeMs / 1000;

    const slowTrend =
      Math.sin(seconds / (540 + (seed % 90)) + seed * 0.001) *
      asset.volatility *
      1.2;

    const mediumWave =
      Math.sin(seconds / (92 + (seed % 33)) + seed * 0.017) *
      asset.volatility *
      0.75;

    const fastWave =
      Math.sin(seconds / (16 + (seed % 7)) + seed * 0.031) *
      asset.volatility *
      0.32;

    const microNoise =
      this.smoothNoise(asset.symbol, Math.floor(timeMs / 1400), 0.23) *
      asset.volatility *
      0.45;

    const sessionPressure =
      this.sessionVolatilityMultiplier(timeMs) * asset.volatility * 0.18;

    const directionBias =
      Math.sin(seconds / (1300 + (seed % 300)) + seed * 0.006) *
      asset.volatility *
      0.45;

    const totalMove =
      slowTrend +
      mediumWave +
      fastWave +
      microNoise +
      sessionPressure +
      directionBias;

    const price = asset.basePrice * (1 + totalMove);

    return Math.max(price, asset.basePrice * 0.05);
  }

  private buildWick(
    asset: MarketAsset,
    candleStart: number,
    timeframe: string,
    bodyHigh: number,
    bodyLow: number,
  ) {
    const seconds = TIMEFRAME_SECONDS[timeframe];
    const baseRange = asset.basePrice * asset.volatility;
    const timeframeMultiplier = Math.sqrt(Math.max(seconds, 5) / 60);
    const randomA = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:wick-a`);
    const randomB = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:wick-b`);

    const wickSizeHigh = baseRange * timeframeMultiplier * (0.08 + randomA * 0.22);
    const wickSizeLow = baseRange * timeframeMultiplier * (0.08 + randomB * 0.22);

    return {
      high: bodyHigh + wickSizeHigh,
      low: bodyLow - wickSizeLow,
    };
  }

  private buildTickVolume(
    asset: MarketAsset,
    candleStart: number,
    timeframe: string,
  ) {
    const seconds = TIMEFRAME_SECONDS[timeframe];
    const base = Math.max(8, Math.floor(seconds / 2));
    const random = this.seededRandom(`${asset.symbol}:${timeframe}:${candleStart}:volume`);

    return Math.floor(base + random * base * 3);
  }

  private getSampleCount(seconds: number) {
    if (seconds <= 5) return 4;
    if (seconds <= 15) return 5;
    if (seconds <= 30) return 6;
    if (seconds <= 60) return 8;
    if (seconds <= 180) return 10;
    if (seconds <= 300) return 12;
    if (seconds <= 900) return 16;
    if (seconds <= 1800) return 20;

    return 24;
  }

  private sessionVolatilityMultiplier(timeMs: number) {
    const date = new Date(timeMs);
    const utcHour = date.getUTCHours();

    if (utcHour >= 7 && utcHour <= 16) return 0.22;
    if (utcHour >= 13 && utcHour <= 21) return 0.3;
    if (utcHour >= 0 && utcHour <= 5) return -0.12;

    return 0.05;
  }

  private smoothNoise(key: string, bucket: number, smoothness: number) {
    const current = this.seededRandom(`${key}:${bucket}`);
    const next = this.seededRandom(`${key}:${bucket + 1}`);
    const ratio = smoothness;

    return (current * (1 - ratio) + next * ratio - 0.5) * 2;
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

    const normalized = Math.abs(hash >>> 0) / 4294967295;

    return normalized;
  }

  private assetSeed(symbol: string) {
    return Math.floor(this.seededRandom(symbol) * 1000000);
  }

  private roundPrice(price: number, precision: number) {
    return Number(price.toFixed(precision));
  }

  private normalizeLimit(limit?: number) {
    if (!limit || Number.isNaN(limit)) return 180;

    return Math.min(Math.max(Number(limit), 20), 500);
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