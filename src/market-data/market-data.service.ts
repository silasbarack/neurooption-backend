import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { OtcEngineService } from './otc-engine.service';
import {
  DEFAULT_CANDLE_LIMIT,
  M1_CANDLE_MS,
  MAX_CANDLE_LIMIT,
  OTC_ASSETS,
  OTC_TIMEFRAME,
  SeedAsset,
} from './market-data.constants';
import { GetCandlesDto } from './dto/get-candles.dto';

@Injectable()
export class MarketDataService implements OnModuleInit {
  private assetsReady = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly otcEngine: OtcEngineService,
  ) {}

  async onModuleInit() {
    await this.ensureAssets();
  }

  async getAssets() {
    await this.ensureAssets();

    const assets = await this.prisma.otcAsset.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { symbol: 'asc' }],
    });

    return {
      assets: assets.map((asset) => ({
        symbol: asset.symbol,
        label: asset.label,
        category: asset.category,
        basePrice: Number(asset.basePrice),
        precision: asset.precision,
        payoutBoost: asset.payoutBoost,
        isActive: asset.isActive,
      })),
    };
  }

  async getCandles(query: GetCandlesDto) {
    await this.ensureAssets();

    const symbol = query.asset || query.symbol || 'EUR/USD OTC';
    const timeframe = query.timeframe || OTC_TIMEFRAME;

    if (timeframe !== OTC_TIMEFRAME) {
      throw new BadRequestException('Only M1 timeframe is currently supported.');
    }

    const limit = this.parseLimit(query.limit);
    const seedAsset = this.getSeedAsset(symbol);

    if (!seedAsset) {
      throw new BadRequestException(`Unsupported OTC asset: ${symbol}`);
    }

    await this.catchUpCandles(seedAsset);

    const rows = await this.prisma.otcCandle.findMany({
      where: {
        assetSymbol: seedAsset.symbol,
        timeframe: OTC_TIMEFRAME,
      },
      orderBy: { openTime: 'desc' },
      take: limit,
    });

    const candles = rows.reverse().map((candle) => ({
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
      time: candle.openTime.getTime(),
      openTime: candle.openTime.toISOString(),
      closeTime: candle.closeTime.toISOString(),
    }));

    return {
      asset: {
        symbol: seedAsset.symbol,
        label: seedAsset.label,
        category: seedAsset.category,
        basePrice: seedAsset.basePrice,
        precision: seedAsset.precision,
        payoutBoost: seedAsset.payoutBoost,
      },
      timeframe: OTC_TIMEFRAME,
      serverTime: new Date().toISOString(),
      candles,
    };
  }

  private async ensureAssets() {
    if (this.assetsReady) return;

    for (const asset of OTC_ASSETS) {
      await this.prisma.otcAsset.upsert({
        where: { symbol: asset.symbol },
        update: {
          label: asset.label,
          category: asset.category,
          basePrice: asset.basePrice.toString(),
          precision: asset.precision,
          payoutBoost: asset.payoutBoost,
          isActive: true,
        },
        create: {
          symbol: asset.symbol,
          label: asset.label,
          category: asset.category,
          basePrice: asset.basePrice.toString(),
          precision: asset.precision,
          payoutBoost: asset.payoutBoost,
          isActive: true,
        },
      });
    }

    this.assetsReady = true;
  }

  private async catchUpCandles(asset: SeedAsset) {
    const now = new Date();
    const currentOpenTime = this.floorToMinute(now);
    const currentProgress = this.getCurrentCandleProgress(now);

    const latest = await this.prisma.otcCandle.findFirst({
      where: {
        assetSymbol: asset.symbol,
        timeframe: OTC_TIMEFRAME,
      },
      orderBy: { openTime: 'desc' },
    });

    if (!latest) {
      await this.seedInitialCandles(asset, currentOpenTime, currentProgress);
      return;
    }

    if (latest.openTime.getTime() === currentOpenTime.getTime()) {
      const previous = await this.prisma.otcCandle.findFirst({
        where: {
          assetSymbol: asset.symbol,
          timeframe: OTC_TIMEFRAME,
          openTime: {
            lt: currentOpenTime,
          },
        },
        orderBy: { openTime: 'desc' },
      });

      const previousClose = previous ? Number(previous.close) : Number(latest.open);
      const candle = this.otcEngine.generateCandle(
        asset,
        previousClose,
        currentOpenTime,
        currentProgress,
      );

      await this.upsertCandle(asset.symbol, candle);

      return;
    }

    let previousClose = Number(latest.close);
    let nextOpenTime = new Date(latest.openTime.getTime() + M1_CANDLE_MS);
    let generatedCount = 0;

    while (nextOpenTime.getTime() <= currentOpenTime.getTime()) {
      const isCurrentCandle = nextOpenTime.getTime() === currentOpenTime.getTime();
      const progress = isCurrentCandle ? currentProgress : 1;

      const candle = this.otcEngine.generateCandle(
        asset,
        previousClose,
        nextOpenTime,
        progress,
      );

      await this.upsertCandle(asset.symbol, candle);

      previousClose = candle.close;
      nextOpenTime = new Date(nextOpenTime.getTime() + M1_CANDLE_MS);
      generatedCount += 1;

      if (generatedCount > 5000) {
        break;
      }
    }
  }

  private async seedInitialCandles(
    asset: SeedAsset,
    currentOpenTime: Date,
    currentProgress: number,
  ) {
    const backfillCount = DEFAULT_CANDLE_LIMIT;
    let openTime = new Date(currentOpenTime.getTime() - (backfillCount - 1) * M1_CANDLE_MS);
    let previousClose = asset.basePrice;

    for (let index = 0; index < backfillCount; index += 1) {
      const isCurrentCandle = openTime.getTime() === currentOpenTime.getTime();
      const progress = isCurrentCandle ? currentProgress : 1;

      const candle = this.otcEngine.generateCandle(
        asset,
        previousClose,
        openTime,
        progress,
      );

      await this.upsertCandle(asset.symbol, candle);

      previousClose = candle.close;
      openTime = new Date(openTime.getTime() + M1_CANDLE_MS);
    }
  }

  private async upsertCandle(assetSymbol: string, candle: {
    open: number;
    high: number;
    low: number;
    close: number;
    openTime: Date;
    closeTime: Date;
  }) {
    await this.prisma.otcCandle.upsert({
      where: {
        assetSymbol_timeframe_openTime: {
          assetSymbol,
          timeframe: OTC_TIMEFRAME,
          openTime: candle.openTime,
        },
      },
      update: {
        open: candle.open.toString(),
        high: candle.high.toString(),
        low: candle.low.toString(),
        close: candle.close.toString(),
        closeTime: candle.closeTime,
      },
      create: {
        assetSymbol,
        timeframe: OTC_TIMEFRAME,
        open: candle.open.toString(),
        high: candle.high.toString(),
        low: candle.low.toString(),
        close: candle.close.toString(),
        openTime: candle.openTime,
        closeTime: candle.closeTime,
      },
    });
  }

  private getSeedAsset(symbol: string) {
    return OTC_ASSETS.find(
      (asset) => asset.symbol.toLowerCase() === symbol.toLowerCase(),
    );
  }

  private floorToMinute(date: Date) {
    const value = new Date(date);
    value.setSeconds(0, 0);
    return value;
  }

  private getCurrentCandleProgress(now: Date) {
    const elapsedMs = now.getSeconds() * 1000 + now.getMilliseconds();
    return Math.min(Math.max(elapsedMs / M1_CANDLE_MS, 0.01), 1);
  }

  private parseLimit(limit?: string) {
    const parsed = Number(limit || DEFAULT_CANDLE_LIMIT);

    if (!Number.isFinite(parsed)) return DEFAULT_CANDLE_LIMIT;

    return Math.min(Math.max(Math.floor(parsed), 20), MAX_CANDLE_LIMIT);
  }
}