import { Injectable } from '@nestjs/common';
import { Asset, AssetCategory, MarketType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AssetsQueryDto } from './dto/assets-query.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AssetsQueryDto): Promise<Asset[]> {
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

    const currencyCount = await this.countByCategory(AssetCategory.CURRENCY);
    const cryptoCount = await this.countByCategory(
      AssetCategory.CRYPTOCURRENCY,
    );
    const stockCount = await this.countByCategory(AssetCategory.STOCK);
    const commodityCount = await this.countByCategory(AssetCategory.COMMODITY);
    const indexCount = await this.countByCategory(AssetCategory.INDEX);

    const realCount = await this.countByMarket(MarketType.REAL);
    const otcCount = await this.countByMarket(MarketType.OTC);

    return {
      total,
      categories: [
        {
          category: AssetCategory.CURRENCY,
          count: currencyCount,
        },
        {
          category: AssetCategory.CRYPTOCURRENCY,
          count: cryptoCount,
        },
        {
          category: AssetCategory.STOCK,
          count: stockCount,
        },
        {
          category: AssetCategory.COMMODITY,
          count: commodityCount,
        },
        {
          category: AssetCategory.INDEX,
          count: indexCount,
        },
      ],
      markets: [
        {
          marketType: MarketType.REAL,
          count: realCount,
        },
        {
          marketType: MarketType.OTC,
          count: otcCount,
        },
      ],
    };
  }

  async findById(id: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: {
        id,
      },
    });
  }

  async findBySymbol(
    symbol: string,
    marketType?: MarketType,
  ): Promise<Asset | null> {
    return this.prisma.asset.findFirst({
      where: {
        symbol,
        isActive: true,
        ...(marketType && { marketType }),
      },
    });
  }

  private async countByCategory(category: AssetCategory): Promise<number> {
    return this.prisma.asset.count({
      where: {
        category,
        isActive: true,
      },
    });
  }

  private async countByMarket(marketType: MarketType): Promise<number> {
    return this.prisma.asset.count({
      where: {
        marketType,
        isActive: true,
      },
    });
  }
}