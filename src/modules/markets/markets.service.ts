import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

export interface MarketDefinition {
  id: string;
  symbol: string;
  name: string;
  category: string;
  icon: string;
  payout: number;
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  spread: number;
  isOpen: boolean;
  basePrice: number;
  currentPrice: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdated: Date;
  getPayoutForExpiry: (seconds: number) => number;
}

const PAYOUT_MAP: Record<number, number> = {
  5:70, 15:75, 30:80, 60:85, 120:83, 180:82, 300:85, 600:84, 900:83, 1800:82, 3600:80
};

const BASE_PRICES: Record<string, number> = {
  'EUR/USD':1.0854,'GBP/USD':1.2723,'USD/JPY':149.85,'USD/CHF':0.8912,
  'AUD/USD':0.6534,'USD/CAD':1.3645,'NZD/USD':0.6012,'EUR/GBP':0.8532,
  'EUR/JPY':162.45,'GBP/JPY':190.87,'USD/SGD':1.3456,'USD/MXN':17.45,
  'USD/TRY':32.56,'EUR/AUD':1.6612,'GBP/AUD':1.9478,'AUD/JPY':97.87,
  'CAD/JPY':109.78,'CHF/JPY':168.23,'USD/INR':83.23,'USD/BRL':4.98,
  'BTC/USD':67450,'ETH/USD':3520,'BNB/USD':598,'SOL/USD':178,
  'XRP/USD':0.582,'ADA/USD':0.462,'DOGE/USD':0.158,'AVAX/USD':37.8,
  'MATIC/USD':0.784,'LTC/USD':82.5,
  'XAU/USD':2340.5,'XAG/USD':27.85,'XPT/USD':980,'WTI/USD':78.45,
  'BRENT':82.3,'NGAS':2.34,'COPPER':4.25,'WHEAT':540,'CORN':420,'COFFEE':180,
  'US500':5280,'NAS100':18450,'US30':39800,'GER40':18200,
  'UK100':8100,'FRA40':7950,'JPN225':38500,'AUS200':7850,'HK50':17200,'VIX':14.5,
  'AAPL':185.2,'TSLA':248.5,'AMZN':191.3,'GOOGL':174.8,'MSFT':420.3,
  'META':512.4,'NVDA':875,'NFLX':628,'UBER':76.5,'COIN':215,
  'AMD':168,'PYPL':65.8,'SHOP':72.4,'SQ':68.2,'BABA':78.5,
  'X':54.8,'DIS':112.4,'BAC':38.9,'JPM':198.5,'GS':448,
};

const VOLATILITY_SIGMA: Record<string, number> = {
  low: 0.00008, medium: 0.00015, high: 0.0003, extreme: 0.0006,
};

const RAW_MARKETS = [
  // OTC Forex
  { id:'EUR/USD-OTC', symbol:'EUR/USD', name:'Euro / US Dollar',     category:'OTC_FOREX',        payout:85, volatility:'medium', spread:0.0002 },
  { id:'GBP/USD-OTC', symbol:'GBP/USD', name:'British Pound / USD',  category:'OTC_FOREX',        payout:83, volatility:'high',   spread:0.0003 },
  { id:'USD/JPY-OTC', symbol:'USD/JPY', name:'US Dollar / Yen',      category:'OTC_FOREX',        payout:84, volatility:'medium', spread:0.02   },
  { id:'USD/CHF-OTC', symbol:'USD/CHF', name:'USD / Swiss Franc',    category:'OTC_FOREX',        payout:82, volatility:'medium', spread:0.0003 },
  { id:'AUD/USD-OTC', symbol:'AUD/USD', name:'Aussie / USD',         category:'OTC_FOREX',        payout:81, volatility:'medium', spread:0.0003 },
  { id:'USD/CAD-OTC', symbol:'USD/CAD', name:'USD / Canadian Dollar',category:'OTC_FOREX',        payout:80, volatility:'medium', spread:0.0003 },
  { id:'NZD/USD-OTC', symbol:'NZD/USD', name:'NZD / USD',            category:'OTC_FOREX',        payout:80, volatility:'medium', spread:0.0004 },
  { id:'EUR/GBP-OTC', symbol:'EUR/GBP', name:'Euro / British Pound', category:'OTC_FOREX',        payout:79, volatility:'low',    spread:0.0003 },
  { id:'EUR/JPY-OTC', symbol:'EUR/JPY', name:'Euro / Yen',           category:'OTC_FOREX',        payout:82, volatility:'high',   spread:0.04   },
  { id:'GBP/JPY-OTC', symbol:'GBP/JPY', name:'GBP / Yen',           category:'OTC_FOREX',        payout:83, volatility:'high',   spread:0.05   },
  { id:'USD/SGD-OTC', symbol:'USD/SGD', name:'USD / Singapore $',    category:'OTC_FOREX',        payout:78, volatility:'low',    spread:0.0005 },
  { id:'USD/MXN-OTC', symbol:'USD/MXN', name:'USD / Mexican Peso',   category:'OTC_FOREX',        payout:80, volatility:'high',   spread:0.01   },
  { id:'USD/TRY-OTC', symbol:'USD/TRY', name:'USD / Turkish Lira',   category:'OTC_FOREX',        payout:82, volatility:'extreme',spread:0.05   },
  { id:'EUR/AUD-OTC', symbol:'EUR/AUD', name:'Euro / Aussie',        category:'OTC_FOREX',        payout:79, volatility:'medium', spread:0.0004 },
  { id:'GBP/AUD-OTC', symbol:'GBP/AUD', name:'GBP / Aussie',        category:'OTC_FOREX',        payout:80, volatility:'high',   spread:0.0005 },
  { id:'AUD/JPY-OTC', symbol:'AUD/JPY', name:'Aussie / Yen',         category:'OTC_FOREX',        payout:81, volatility:'high',   spread:0.04   },
  { id:'CAD/JPY-OTC', symbol:'CAD/JPY', name:'CAD / Yen',            category:'OTC_FOREX',        payout:80, volatility:'high',   spread:0.04   },
  { id:'CHF/JPY-OTC', symbol:'CHF/JPY', name:'CHF / Yen',            category:'OTC_FOREX',        payout:80, volatility:'high',   spread:0.04   },
  { id:'USD/INR-OTC', symbol:'USD/INR', name:'USD / Indian Rupee',   category:'OTC_FOREX',        payout:78, volatility:'medium', spread:0.05   },
  { id:'USD/BRL-OTC', symbol:'USD/BRL', name:'USD / Brazilian Real', category:'OTC_FOREX',        payout:80, volatility:'high',   spread:0.03   },
  // OTC Crypto
  { id:'BTC/USD-OTC', symbol:'BTC/USD', name:'Bitcoin / USD',        category:'OTC_CRYPTO',       payout:90, volatility:'extreme',spread:15     },
  { id:'ETH/USD-OTC', symbol:'ETH/USD', name:'Ethereum / USD',       category:'OTC_CRYPTO',       payout:88, volatility:'extreme',spread:0.8    },
  { id:'BNB/USD-OTC', symbol:'BNB/USD', name:'BNB / USD',            category:'OTC_CRYPTO',       payout:86, volatility:'high',   spread:0.2    },
  { id:'SOL/USD-OTC', symbol:'SOL/USD', name:'Solana / USD',         category:'OTC_CRYPTO',       payout:87, volatility:'extreme',spread:0.1    },
  { id:'XRP/USD-OTC', symbol:'XRP/USD', name:'Ripple / USD',         category:'OTC_CRYPTO',       payout:85, volatility:'high',   spread:0.003  },
  { id:'ADA/USD-OTC', symbol:'ADA/USD', name:'Cardano / USD',        category:'OTC_CRYPTO',       payout:84, volatility:'high',   spread:0.001  },
  { id:'DOGE/USD-OTC',symbol:'DOGE/USD',name:'Dogecoin / USD',       category:'OTC_CRYPTO',       payout:85, volatility:'extreme',spread:0.001  },
  { id:'AVAX/USD-OTC',symbol:'AVAX/USD',name:'Avalanche / USD',      category:'OTC_CRYPTO',       payout:86, volatility:'high',   spread:0.05   },
  { id:'MATIC/USD-OTC',symbol:'MATIC/USD',name:'Polygon / USD',      category:'OTC_CRYPTO',       payout:84, volatility:'high',   spread:0.002  },
  { id:'LTC/USD-OTC', symbol:'LTC/USD', name:'Litecoin / USD',       category:'OTC_CRYPTO',       payout:83, volatility:'high',   spread:0.1    },
  // OTC Commodities
  { id:'GOLD-OTC',    symbol:'XAU/USD', name:'Gold / USD',           category:'OTC_COMMODITIES',  payout:82, volatility:'medium', spread:0.5    },
  { id:'SILVER-OTC',  symbol:'XAG/USD', name:'Silver / USD',         category:'OTC_COMMODITIES',  payout:80, volatility:'high',   spread:0.01   },
  { id:'PLATINUM-OTC',symbol:'XPT/USD', name:'Platinum / USD',       category:'OTC_COMMODITIES',  payout:79, volatility:'medium', spread:1.0    },
  { id:'OIL-OTC',     symbol:'WTI/USD', name:'Crude Oil / USD',      category:'OTC_COMMODITIES',  payout:83, volatility:'high',   spread:0.05   },
  { id:'BRENT-OTC',   symbol:'BRENT',   name:'Brent Oil / USD',      category:'OTC_COMMODITIES',  payout:82, volatility:'high',   spread:0.05   },
  { id:'GAS-OTC',     symbol:'NGAS',    name:'Natural Gas',           category:'OTC_COMMODITIES',  payout:80, volatility:'extreme',spread:0.01   },
  { id:'COPPER-OTC',  symbol:'COPPER',  name:'Copper / USD',          category:'OTC_COMMODITIES',  payout:79, volatility:'medium', spread:0.01   },
  { id:'WHEAT-OTC',   symbol:'WHEAT',   name:'Wheat',                category:'OTC_COMMODITIES',  payout:78, volatility:'medium', spread:0.5    },
  { id:'CORN-OTC',    symbol:'CORN',    name:'Corn',                  category:'OTC_COMMODITIES',  payout:78, volatility:'medium', spread:0.3    },
  { id:'COFFEE-OTC',  symbol:'COFFEE',  name:'Coffee',                category:'OTC_COMMODITIES',  payout:79, volatility:'high',   spread:0.2    },
  // OTC Indices
  { id:'SP500-OTC',   symbol:'US500',   name:'S&P 500 Index',         category:'OTC_INDICES',      payout:83, volatility:'medium', spread:0.5    },
  { id:'NASDAQ-OTC',  symbol:'NAS100',  name:'Nasdaq 100',            category:'OTC_INDICES',      payout:84, volatility:'high',   spread:1.0    },
  { id:'DOW-OTC',     symbol:'US30',    name:'Dow Jones',             category:'OTC_INDICES',      payout:82, volatility:'medium', spread:2.0    },
  { id:'DAX-OTC',     symbol:'GER40',   name:'DAX 40',                category:'OTC_INDICES',      payout:82, volatility:'medium', spread:1.0    },
  { id:'FTSE-OTC',    symbol:'UK100',   name:'FTSE 100',              category:'OTC_INDICES',      payout:81, volatility:'medium', spread:1.5    },
  { id:'CAC-OTC',     symbol:'FRA40',   name:'CAC 40',                category:'OTC_INDICES',      payout:80, volatility:'medium', spread:1.0    },
  { id:'NIKKEI-OTC',  symbol:'JPN225',  name:'Nikkei 225',            category:'OTC_INDICES',      payout:82, volatility:'high',   spread:5.0    },
  { id:'ASX-OTC',     symbol:'AUS200',  name:'ASX 200',               category:'OTC_INDICES',      payout:80, volatility:'medium', spread:2.0    },
  { id:'HANG-OTC',    symbol:'HK50',    name:'Hang Seng',             category:'OTC_INDICES',      payout:82, volatility:'high',   spread:5.0    },
  { id:'VIX-OTC',     symbol:'VIX',     name:'Volatility Index',      category:'OTC_INDICES',      payout:86, volatility:'extreme',spread:0.05   },
  // OTC Stocks
  { id:'AAPL-OTC',    symbol:'AAPL',    name:'Apple Inc.',            category:'OTC_STOCKS',       payout:80, volatility:'medium', spread:0.05   },
  { id:'TSLA-OTC',    symbol:'TSLA',    name:'Tesla Inc.',            category:'OTC_STOCKS',       payout:85, volatility:'extreme',spread:0.2    },
  { id:'AMZN-OTC',    symbol:'AMZN',    name:'Amazon.com',            category:'OTC_STOCKS',       payout:81, volatility:'high',   spread:0.15   },
  { id:'GOOGL-OTC',   symbol:'GOOGL',   name:'Alphabet Inc.',         category:'OTC_STOCKS',       payout:80, volatility:'medium', spread:0.1    },
  { id:'MSFT-OTC',    symbol:'MSFT',    name:'Microsoft Corp.',       category:'OTC_STOCKS',       payout:80, volatility:'medium', spread:0.05   },
  { id:'META-OTC',    symbol:'META',    name:'Meta Platforms',        category:'OTC_STOCKS',       payout:82, volatility:'high',   spread:0.1    },
  { id:'NVDA-OTC',    symbol:'NVDA',    name:'NVIDIA Corp.',          category:'OTC_STOCKS',       payout:86, volatility:'extreme',spread:0.2    },
  { id:'NFLX-OTC',    symbol:'NFLX',    name:'Netflix Inc.',          category:'OTC_STOCKS',       payout:83, volatility:'high',   spread:0.15   },
  { id:'UBER-OTC',    symbol:'UBER',    name:'Uber Technologies',     category:'OTC_STOCKS',       payout:81, volatility:'high',   spread:0.05   },
  { id:'COIN-OTC',    symbol:'COIN',    name:'Coinbase Global',       category:'OTC_STOCKS',       payout:85, volatility:'extreme',spread:0.2    },
  { id:'AMD-OTC',     symbol:'AMD',     name:'AMD Inc.',              category:'OTC_STOCKS',       payout:83, volatility:'high',   spread:0.1    },
  { id:'PYPL-OTC',    symbol:'PYPL',    name:'PayPal Holdings',       category:'OTC_STOCKS',       payout:80, volatility:'medium', spread:0.05   },
  { id:'SHOP-OTC',    symbol:'SHOP',    name:'Shopify Inc.',          category:'OTC_STOCKS',       payout:82, volatility:'high',   spread:0.1    },
  { id:'SQ-OTC',      symbol:'SQ',      name:'Block Inc.',            category:'OTC_STOCKS',       payout:81, volatility:'high',   spread:0.05   },
  { id:'BABA-OTC',    symbol:'BABA',    name:'Alibaba Group',         category:'OTC_STOCKS',       payout:82, volatility:'high',   spread:0.1    },
  { id:'DIS-OTC',     symbol:'DIS',     name:'Walt Disney Co.',       category:'OTC_STOCKS',       payout:79, volatility:'medium', spread:0.05   },
  { id:'BAC-OTC',     symbol:'BAC',     name:'Bank of America',       category:'OTC_STOCKS',       payout:79, volatility:'medium', spread:0.03   },
  { id:'JPM-OTC',     symbol:'JPM',     name:'JPMorgan Chase',        category:'OTC_STOCKS',       payout:79, volatility:'medium', spread:0.05   },
  { id:'GS-OTC',      symbol:'GS',      name:'Goldman Sachs',         category:'OTC_STOCKS',       payout:80, volatility:'high',   spread:0.1    },
  // Live markets
  { id:'EUR/USD',     symbol:'EUR/USD', name:'Euro / US Dollar',      category:'LIVE_FOREX',       payout:75, volatility:'medium', spread:0.0001 },
  { id:'GBP/USD',     symbol:'GBP/USD', name:'British Pound / USD',   category:'LIVE_FOREX',       payout:74, volatility:'high',   spread:0.0002 },
  { id:'USD/JPY',     symbol:'USD/JPY', name:'US Dollar / Yen',       category:'LIVE_FOREX',       payout:74, volatility:'medium', spread:0.01   },
  { id:'BTC/USD',     symbol:'BTC/USD', name:'Bitcoin / USD',         category:'LIVE_CRYPTO',      payout:80, volatility:'extreme',spread:10     },
  { id:'ETH/USD',     symbol:'ETH/USD', name:'Ethereum / USD',        category:'LIVE_CRYPTO',      payout:78, volatility:'extreme',spread:0.5    },
  { id:'XAU/USD',     symbol:'XAU/USD', name:'Gold / USD',            category:'LIVE_COMMODITIES', payout:73, volatility:'medium', spread:0.3    },
  { id:'US500',       symbol:'US500',   name:'S&P 500',               category:'LIVE_INDICES',     payout:74, volatility:'medium', spread:0.4    },
  { id:'NAS100',      symbol:'NAS100',  name:'Nasdaq 100',            category:'LIVE_INDICES',     payout:75, volatility:'high',   spread:0.8    },
];

@Injectable()
export class MarketsService implements OnModuleInit {
  private markets = new Map<string, MarketDefinition>();
  private prices = new Map<string, number>();

  onModuleInit() {
    RAW_MARKETS.forEach(m => {
      const basePrice = BASE_PRICES[m.symbol] || 1;
      const def: MarketDefinition = {
        ...m,
        volatility: m.volatility as MarketDefinition['volatility'],
        icon: '●',
        isOpen: true,
        basePrice,
        currentPrice: basePrice,
        bid: basePrice - m.spread / 2,
        ask: basePrice + m.spread / 2,
        change: 0,
        changePercent: 0,
        high24h: basePrice * 1.01,
        low24h: basePrice * 0.99,
        volume24h: Math.random() * 1000000,
        lastUpdated: new Date(),
        getPayoutForExpiry: (seconds: number) => {
          const key = Object.keys(PAYOUT_MAP).map(Number).find(k => k >= seconds) || 3600;
          return PAYOUT_MAP[key] || m.payout;
        },
      };
      this.markets.set(m.id, def);
      this.prices.set(m.id, basePrice);
    });
  }

  @Interval(400) // 400ms tick
  simulatePrices() {
    this.markets.forEach((market, id) => {
      const sigma = VOLATILITY_SIGMA[market.volatility] || 0.00015;
      const p = this.prices.get(id) || market.basePrice;
      const drift = (market.basePrice - p) * 0.0001;
      const noise = (Math.random() - 0.5) * 2 * sigma * p;
      const newPrice = Math.max(p + drift + noise, p * 0.9);

      this.prices.set(id, newPrice);
      market.currentPrice = newPrice;
      market.bid = newPrice - market.spread / 2;
      market.ask = newPrice + market.spread / 2;
      market.change = newPrice - market.basePrice;
      market.changePercent = (market.change / market.basePrice) * 100;
      market.high24h = Math.max(market.high24h, newPrice);
      market.low24h = Math.min(market.low24h, newPrice);
      market.lastUpdated = new Date();
    });
  }

  getAllMarkets(): MarketDefinition[] {
    return Array.from(this.markets.values());
  }

  getMarket(id: string): MarketDefinition | undefined {
    return this.markets.get(id);
  }

  getCurrentPrice(marketId: string): number {
    return this.prices.get(marketId) || 0;
  }

  getOTCMarkets(): MarketDefinition[] {
    return this.getAllMarkets().filter(m => m.category.startsWith('OTC_'));
  }

  getLiveMarkets(): MarketDefinition[] {
    return this.getAllMarkets().filter(m => m.category.startsWith('LIVE_'));
  }

  getMarketsByCategory(category: string): MarketDefinition[] {
    return this.getAllMarkets().filter(m => m.category === category);
  }

  getPriceTick(marketId: string) {
    const m = this.markets.get(marketId);
    if (!m) return null;
    return {
      marketId,
      symbol: m.symbol,
      price: m.currentPrice,
      bid: m.bid,
      ask: m.ask,
      change: m.change,
      changePercent: m.changePercent,
      high24h: m.high24h,
      low24h: m.low24h,
      ts: m.lastUpdated.getTime(),
    };
  }

  getAllTicks() {
    return Array.from(this.markets.keys()).map(id => this.getPriceTick(id));
  }
}
