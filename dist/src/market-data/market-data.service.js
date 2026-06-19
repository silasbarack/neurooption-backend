"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const otc_engine_service_1 = require("./otc-engine.service");
const market_data_constants_1 = require("./market-data.constants");
let MarketDataService = class MarketDataService {
    constructor(prisma, otcEngine) {
        this.prisma = prisma;
        this.otcEngine = otcEngine;
        this.assetsReady = false;
    }
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
    async getCandles(query) {
        await this.ensureAssets();
        const symbol = query.asset || query.symbol || 'EUR/USD OTC';
        const timeframe = query.timeframe || market_data_constants_1.OTC_TIMEFRAME;
        if (timeframe !== market_data_constants_1.OTC_TIMEFRAME) {
            throw new common_1.BadRequestException('Only M1 timeframe is currently supported.');
        }
        const limit = this.parseLimit(query.limit);
        const seedAsset = this.getSeedAsset(symbol);
        if (!seedAsset) {
            throw new common_1.BadRequestException(`Unsupported OTC asset: ${symbol}`);
        }
        await this.catchUpCandles(seedAsset);
        const rows = await this.prisma.otcCandle.findMany({
            where: {
                assetSymbol: seedAsset.symbol,
                timeframe: market_data_constants_1.OTC_TIMEFRAME,
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
            timeframe: market_data_constants_1.OTC_TIMEFRAME,
            serverTime: new Date().toISOString(),
            candles,
        };
    }
    async ensureAssets() {
        if (this.assetsReady)
            return;
        for (const asset of market_data_constants_1.OTC_ASSETS) {
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
    async catchUpCandles(asset) {
        const now = new Date();
        const currentOpenTime = this.floorToMinute(now);
        const currentProgress = this.getCurrentCandleProgress(now);
        const latest = await this.prisma.otcCandle.findFirst({
            where: {
                assetSymbol: asset.symbol,
                timeframe: market_data_constants_1.OTC_TIMEFRAME,
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
                    timeframe: market_data_constants_1.OTC_TIMEFRAME,
                    openTime: {
                        lt: currentOpenTime,
                    },
                },
                orderBy: { openTime: 'desc' },
            });
            const previousClose = previous ? Number(previous.close) : Number(latest.open);
            const candle = this.otcEngine.generateCandle(asset, previousClose, currentOpenTime, currentProgress);
            await this.upsertCandle(asset.symbol, candle);
            return;
        }
        let previousClose = Number(latest.close);
        let nextOpenTime = new Date(latest.openTime.getTime() + market_data_constants_1.M1_CANDLE_MS);
        let generatedCount = 0;
        while (nextOpenTime.getTime() <= currentOpenTime.getTime()) {
            const isCurrentCandle = nextOpenTime.getTime() === currentOpenTime.getTime();
            const progress = isCurrentCandle ? currentProgress : 1;
            const candle = this.otcEngine.generateCandle(asset, previousClose, nextOpenTime, progress);
            await this.upsertCandle(asset.symbol, candle);
            previousClose = candle.close;
            nextOpenTime = new Date(nextOpenTime.getTime() + market_data_constants_1.M1_CANDLE_MS);
            generatedCount += 1;
            if (generatedCount > 5000) {
                break;
            }
        }
    }
    async seedInitialCandles(asset, currentOpenTime, currentProgress) {
        const backfillCount = market_data_constants_1.DEFAULT_CANDLE_LIMIT;
        let openTime = new Date(currentOpenTime.getTime() - (backfillCount - 1) * market_data_constants_1.M1_CANDLE_MS);
        let previousClose = asset.basePrice;
        for (let index = 0; index < backfillCount; index += 1) {
            const isCurrentCandle = openTime.getTime() === currentOpenTime.getTime();
            const progress = isCurrentCandle ? currentProgress : 1;
            const candle = this.otcEngine.generateCandle(asset, previousClose, openTime, progress);
            await this.upsertCandle(asset.symbol, candle);
            previousClose = candle.close;
            openTime = new Date(openTime.getTime() + market_data_constants_1.M1_CANDLE_MS);
        }
    }
    async upsertCandle(assetSymbol, candle) {
        await this.prisma.otcCandle.upsert({
            where: {
                assetSymbol_timeframe_openTime: {
                    assetSymbol,
                    timeframe: market_data_constants_1.OTC_TIMEFRAME,
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
                timeframe: market_data_constants_1.OTC_TIMEFRAME,
                open: candle.open.toString(),
                high: candle.high.toString(),
                low: candle.low.toString(),
                close: candle.close.toString(),
                openTime: candle.openTime,
                closeTime: candle.closeTime,
            },
        });
    }
    getSeedAsset(symbol) {
        return market_data_constants_1.OTC_ASSETS.find((asset) => asset.symbol.toLowerCase() === symbol.toLowerCase());
    }
    floorToMinute(date) {
        const value = new Date(date);
        value.setSeconds(0, 0);
        return value;
    }
    getCurrentCandleProgress(now) {
        const elapsedMs = now.getSeconds() * 1000 + now.getMilliseconds();
        return Math.min(Math.max(elapsedMs / market_data_constants_1.M1_CANDLE_MS, 0.01), 1);
    }
    parseLimit(limit) {
        const parsed = Number(limit || market_data_constants_1.DEFAULT_CANDLE_LIMIT);
        if (!Number.isFinite(parsed))
            return market_data_constants_1.DEFAULT_CANDLE_LIMIT;
        return Math.min(Math.max(Math.floor(parsed), 20), market_data_constants_1.MAX_CANDLE_LIMIT);
    }
};
exports.MarketDataService = MarketDataService;
exports.MarketDataService = MarketDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        otc_engine_service_1.OtcEngineService])
], MarketDataService);
//# sourceMappingURL=market-data.service.js.map