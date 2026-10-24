import { PrismaClient, AssetCategory, MarketType } from "@prisma/client";
import { assets } from "./seed/assets.seed";

const prisma = new PrismaClient();

function getCategory(assetName: string): AssetCategory {
  const currencies = [
    "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "USD/CHF",
    "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "CAD/JPY",
    "CHF/JPY", "EUR/AUD", "EUR/CAD", "GBP/AUD", "GBP/CAD", "AUD/CAD",
    "AUD/NZD", "NZD/JPY", "NZD/CAD", "EUR/CHF", "GBP/CHF", "CAD/CHF",
    "USD/CNY", "CNY/JPY", "USD/KES", "KES/USD", "NGN/USD", "USD/NGN",
    "USD/ZAR", "USD/TRY", "USD/MXN"
  ];

  const cryptos = [
    "Bitcoin", "Ethereum", "BNB", "Solana", "XRP", "Cardano", "Dogecoin",
    "TRON", "Litecoin", "Bitcoin Cash", "Avalanche", "Polkadot", "Chainlink",
    "Polygon", "Toncoin", "Shiba Inu", "Stellar", "Ethereum Classic", "Cosmos",
    "Near Protocol", "Filecoin", "Aptos", "Arbitrum", "Optimism", "Uniswap",
    "Internet Computer", "Render"
  ];

  const stocks = [
    "Apple", "Microsoft", "Tesla", "Amazon", "Nvidia", "Meta", "Google",
    "Netflix", "AMD", "Intel", "Coca-Cola", "PepsiCo", "Nike", "McDonald's",
    "Visa", "Mastercard", "JPMorgan Chase", "Bank of America", "Boeing",
    "Walmart", "Disney", "PayPal", "Adobe", "Salesforce", "Oracle", "Cisco",
    "IBM", "Toyota", "Alibaba", "Tencent", "Shell", "ExxonMobil", "Chevron",
    "Uber"
  ];

  const commodities = [
    "Gold", "Silver", "Platinum", "Palladium", "Copper", "Aluminium",
    "Nickel", "Brent Oil", "WTI Oil", "Natural Gas", "Heating Oil", "Coffee",
    "Cocoa", "Sugar", "Cotton", "Wheat", "Corn", "Soybeans", "Rice",
    "Orange Juice", "Live Cattle", "Lean Hogs"
  ];

  if (currencies.includes(assetName)) return AssetCategory.CURRENCY;
  if (cryptos.includes(assetName)) return AssetCategory.CRYPTOCURRENCY;
  if (stocks.includes(assetName)) return AssetCategory.STOCK;
  if (commodities.includes(assetName)) return AssetCategory.COMMODITY;

  return AssetCategory.INDEX;
}

function makeSymbol(assetName: string, marketType: MarketType): string {
  const base = assetName
    .toUpperCase()
    .replaceAll("/", "")
    .replaceAll(" ", "_")
    .replaceAll("-", "_")
    .replaceAll("'", "");

  return marketType === MarketType.OTC ? `${base}_OTC` : base;
}

function getPayoutRate(category: AssetCategory, marketType: MarketType): number {
  if (marketType === MarketType.OTC) return 0.88;

  switch (category) {
    case AssetCategory.CURRENCY:
      return 0.82;
    case AssetCategory.CRYPTOCURRENCY:
      return 0.78;
    case AssetCategory.STOCK:
      return 0.75;
    case AssetCategory.COMMODITY:
      return 0.80;
    case AssetCategory.INDEX:
      return 0.79;
    default:
      return 0.75;
  }
}

async function main() {
  for (const assetName of assets) {
    const category = getCategory(assetName);

    for (const marketType of [MarketType.REAL, MarketType.OTC]) {
      const symbol = makeSymbol(assetName, marketType);

      await prisma.asset.upsert({
        where: {
          symbol_marketType: {
            symbol,
            marketType,
          },
        },
        update: {
          name: assetName,
          category,
          isActive: true,
          payoutRate: getPayoutRate(category, marketType),
        },
        create: {
          symbol,
          name: assetName,
          category,
          marketType,
          isActive: true,
          payoutRate: getPayoutRate(category, marketType),
        },
      });
    }
  }

  console.log("Assets seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });