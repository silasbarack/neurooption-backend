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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma.service");
let AssetsService = class AssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { category, marketType, search } = query;
        return this.prisma.asset.findMany({
            where: {
                isActive: true,
                ...(category && { category }),
                ...(marketType && { marketType }),
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            symbol: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ],
                }),
            },
            orderBy: [
                {
                    category: 'asc',
                },
                {
                    marketType: 'asc',
                },
                {
                    name: 'asc',
                },
            ],
        });
    }
    async getSummary() {
        const total = await this.prisma.asset.count({
            where: {
                isActive: true,
            },
        });
        const currencyCount = await this.countByCategory(client_1.AssetCategory.CURRENCY);
        const cryptoCount = await this.countByCategory(client_1.AssetCategory.CRYPTOCURRENCY);
        const stockCount = await this.countByCategory(client_1.AssetCategory.STOCK);
        const commodityCount = await this.countByCategory(client_1.AssetCategory.COMMODITY);
        const indexCount = await this.countByCategory(client_1.AssetCategory.INDEX);
        const realCount = await this.countByMarket(client_1.MarketType.REAL);
        const otcCount = await this.countByMarket(client_1.MarketType.OTC);
        return {
            total,
            categories: [
                {
                    category: client_1.AssetCategory.CURRENCY,
                    count: currencyCount,
                },
                {
                    category: client_1.AssetCategory.CRYPTOCURRENCY,
                    count: cryptoCount,
                },
                {
                    category: client_1.AssetCategory.STOCK,
                    count: stockCount,
                },
                {
                    category: client_1.AssetCategory.COMMODITY,
                    count: commodityCount,
                },
                {
                    category: client_1.AssetCategory.INDEX,
                    count: indexCount,
                },
            ],
            markets: [
                {
                    marketType: client_1.MarketType.REAL,
                    count: realCount,
                },
                {
                    marketType: client_1.MarketType.OTC,
                    count: otcCount,
                },
            ],
        };
    }
    async findById(id) {
        return this.prisma.asset.findUnique({
            where: {
                id,
            },
        });
    }
    async findBySymbol(symbol, marketType) {
        return this.prisma.asset.findFirst({
            where: {
                symbol,
                isActive: true,
                ...(marketType && { marketType }),
            },
        });
    }
    async countByCategory(category) {
        return this.prisma.asset.count({
            where: {
                category,
                isActive: true,
            },
        });
    }
    async countByMarket(marketType) {
        return this.prisma.asset.count({
            where: {
                marketType,
                isActive: true,
            },
        });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map