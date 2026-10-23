import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface Asset {
  id: string; name: string; category: string;
  payout: number; base: number; vol: number; icon: string;
  isOTC: boolean; isActive: boolean;
}

@Injectable()
export class MarketDataService implements OnModuleInit {
  private prices: Map<string, number> = new Map();
  private assets: Asset[] = [
    { id: 'EURUSD_OTC', name: 'EUR/USD OTC', category: 'Forex OTC', payout: 92, base: 1.0854, vol: 0.0012, icon: '🇪🇺', isOTC: true, isActive: true },
    { id: 'GBPUSD_OTC', name: 'GBP/USD OTC', category: 'Forex OTC', payout: 89, base: 1.2678, vol: 0.0015, icon: '🇬🇧', isOTC: true, isActive: true },
    { id: 'USDJPY_OTC', name: 'USD/JPY OTC', category: 'Forex OTC', payout: 91, base: 151.34, vol: 0.08, icon: '🇯🇵', isOTC: true, isActive: true },
    { id: 'AUDUSD_OTC', name: 'AUD/USD OTC', category: 'Forex OTC', payout: 88, base: 0.6523, vol: 0.001, icon: '🇦🇺', isOTC: true, isActive: true },
    { id: 'AUDJPY_OTC', name: 'AUD/JPY OTC', category: 'Forex OTC', payout: 87, base: 98.23, vol: 0.06, icon: '🇦🇺', isOTC: true, isActive: true },
    { id: 'EURJPY_OTC', name: 'EUR/JPY OTC', category: 'Forex OTC', payout: 90, base: 163.42, vol: 0.07, icon: '🇪🇺', isOTC: true, isActive: true },
    { id: 'NZDUSD_OTC', name: 'NZD/USD OTC', category: 'Forex OTC', payout: 86, base: 0.5987, vol: 0.0009, icon: '🇳🇿', isOTC: true, isActive: true },
    { id: 'USDCAD_OTC', name: 'USD/CAD OTC', category: 'Forex OTC', payout: 88, base: 1.3612, vol: 0.0011, icon: '🇨🇦', isOTC: true, isActive: true },
    { id: 'USDCHF_OTC', name: 'USD/CHF OTC', category: 'Forex OTC', payout: 87, base: 0.9042, vol: 0.0010, icon: '🇨🇭', isOTC: true, isActive: true },
    { id: 'EURGBP_OTC', name: 'EUR/GBP OTC', category: 'Forex OTC', payout: 86, base: 0.8567, vol: 0.0008, icon: '🇪🇺', isOTC: true, isActive: true },
    { id: 'BTCUSD_OTC', name: 'BTC/USD OTC', category: 'Crypto OTC', payout: 85, base: 67234, vol: 450, icon: '₿', isOTC: true, isActive: true },
    { id: 'ETHUSD_OTC', name: 'ETH/USD OTC', category: 'Crypto OTC', payout: 84, base: 3421, vol: 55, icon: 'Ξ', isOTC: true, isActive: true },
    { id: 'XRPUSD_OTC', name: 'XRP/USD OTC', category: 'Crypto OTC', payout: 83, base: 0.5234, vol: 0.008, icon: '✦', isOTC: true, isActive: true },
    { id: 'BNBUSD_OTC', name: 'BNB/USD OTC', category: 'Crypto OTC', payout: 82, base: 412.5, vol: 6, icon: '⬡', isOTC: true, isActive: true },
    { id: 'SOLUSD_OTC', name: 'SOL/USD OTC', category: 'Crypto OTC', payout: 84, base: 178.3, vol: 3.2, icon: '◎', isOTC: true, isActive: true },
    { id: 'DOGEUSD_OTC', name: 'DOGE/USD OTC', category: 'Crypto OTC', payout: 81, base: 0.1534, vol: 0.003, icon: '🐕', isOTC: true, isActive: true },
    { id: 'GOLD_OTC', name: 'XAU/USD OTC', category: 'Commodities OTC', payout: 90, base: 2341.5, vol: 8, icon: '🥇', isOTC: true, isActive: true },
    { id: 'SILVER_OTC', name: 'XAG/USD OTC', category: 'Commodities OTC', payout: 87, base: 29.42, vol: 0.3, icon: '🥈', isOTC: true, isActive: true },
    { id: 'OIL_OTC', name: 'OIL/USD OTC', category: 'Commodities OTC', payout: 88, base: 78.34, vol: 0.8, icon: '🛢️', isOTC: true, isActive: true },
    { id: 'NATGAS_OTC', name: 'NAT.GAS OTC', category: 'Commodities OTC', payout: 85, base: 2.34, vol: 0.04, icon: '🔥', isOTC: true, isActive: true },
    { id: 'SPX500_OTC', name: 'S&P 500 OTC', category: 'Indices OTC', payout: 91, base: 5203.4, vol: 22, icon: '📈', isOTC: true, isActive: true },
    { id: 'NDX100_OTC', name: 'NASDAQ 100 OTC', category: 'Indices OTC', payout: 89, base: 18234.5, vol: 88, icon: '📊', isOTC: true, isActive: true },
    { id: 'DJI_OTC', name: 'Dow Jones OTC', category: 'Indices OTC', payout: 88, base: 39421.3, vol: 120, icon: '🏛️', isOTC: true, isActive: true },
    { id: 'DAX40_OTC', name: 'DAX 40 OTC', category: 'Indices OTC', payout: 87, base: 17823.4, vol: 85, icon: '🇩🇪', isOTC: true, isActive: true },
    { id: 'FTSE100_OTC', name: 'FTSE 100 OTC', category: 'Indices OTC', payout: 86, base: 7823.6, vol: 45, icon: '🇬🇧', isOTC: true, isActive: true },
    { id: 'TSLA_OTC', name: 'TSLA OTC', category: 'Stocks OTC', payout: 85, base: 182.44, vol: 3.5, icon: '🚗', isOTC: true, isActive: true },
    { id: 'AAPL_OTC', name: 'AAPL OTC', category: 'Stocks OTC', payout: 87, base: 189.34, vol: 2.8, icon: '🍎', isOTC: true, isActive: true },
    { id: 'AMZN_OTC', name: 'AMZN OTC', category: 'Stocks OTC', payout: 86, base: 178.92, vol: 3.1, icon: '📦', isOTC: true, isActive: true },
    { id: 'GOOGL_OTC', name: 'GOOGL OTC', category: 'Stocks OTC', payout: 85, base: 157.43, vol: 2.4, icon: '🔍', isOTC: true, isActive: true },
    { id: 'META_OTC', name: 'META OTC', category: 'Stocks OTC', payout: 84, base: 494.32, vol: 6.2, icon: '👤', isOTC: true, isActive: true },
    { id: 'MSFT_OTC', name: 'MSFT OTC', category: 'Stocks OTC', payout: 87, base: 419.56, vol: 4.8, icon: '🪟', isOTC: true, isActive: true },
    { id: 'NVDA_OTC', name: 'NVDA OTC', category: 'Stocks OTC', payout: 84, base: 876.34, vol: 12, icon: '🎮', isOTC: true, isActive: true },
  ];

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    this.assets.forEach(a => this.prices.set(a.id, a.base));
    this.startPriceFeed();
  }

  private startPriceFeed() {
    setInterval(() => {
      const ticks: any[] = [];
      this.assets.forEach(asset => {
        const current = this.prices.get(asset.id) || asset.base;
        const move = (Math.random() - 0.499) * asset.vol * 2;
        const newPrice = Math.max(0.0001, current + move);
        this.prices.set(asset.id, newPrice);
        ticks.push({ assetId: asset.id, price: newPrice, timestamp: Date.now() });
      });
      this.eventEmitter.emit('market.tick', ticks);
    }, 400);
  }

  getAsset(id: string): Asset | undefined { return this.assets.find(a => a.id === id); }
  getAllAssets(): Asset[] { return this.assets.filter(a => a.isActive); }
  getCurrentPrice(assetId: string): number { return this.prices.get(assetId) || 0; }
  getAllPrices(): Record<string, number> { return Object.fromEntries(this.prices); }

  generateOHLC(assetId: string, bars = 120): any[] {
    const asset = this.getAsset(assetId);
    if (!asset) return [];
    let price = asset.base;
    return Array.from({ length: bars }, (_, i) => {
      const open = price;
      const move = (Math.random() - 0.499) * asset.vol * 2;
      const close = Math.max(0.0001, open + move);
      const high = Math.max(open, close) + Math.random() * asset.vol * 0.5;
      const low = Math.min(open, close) - Math.random() * asset.vol * 0.5;
      price = close;
      return { time: Date.now() - (bars - i) * 60000, open, high, low, close, volume: Math.floor(Math.random() * 1000 + 200) };
    });
  }
}
