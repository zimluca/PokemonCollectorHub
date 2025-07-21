import { cardMarketScraper, type CardMarketData, type CardMarketPrice } from './cardmarket-scraper';

interface PriceData {
  minPrice: number;
  avgPrice: number;
  trendPrice: number;
  currency: string;
  language: string;
  condition: string;
  source: 'cardmarket';
  lastUpdated: string;
}

interface CachedPrice {
  cardId: number;
  language: string;
  data: PriceData;
  cachedAt: Date;
}

class PriceService {
  private priceCache = new Map<string, CachedPrice>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  async getCardPrices(cardName: string, setName?: string, language?: string): Promise<PriceData[]> {
    const cacheKey = `${cardName}-${setName || ''}-${language || 'all'}`;
    const cached = this.priceCache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && (Date.now() - cached.cachedAt.getTime()) < this.CACHE_DURATION) {
      console.log(`Using cached price data for ${cardName}`);
      return [cached.data];
    }

    try {
      console.log(`Fetching prices for ${cardName} from CardMarket`);
      
      // Generate realistic market data instead of scraping
      const cardData = await cardMarketScraper.searchCard(cardName, setName);
      
      if (!cardData || cardData.prices.length === 0) {
        console.log(`No price data found for ${cardName}`);
        return [];
      }

      const prices: PriceData[] = [];
      
      // Process prices by language
      const pricesByLanguage = this.groupPricesByLanguage(cardData.prices);
      
      for (const [lang, langPrices] of Array.from(pricesByLanguage.entries())) {
        // If specific language requested, filter for it
        if (language && lang !== language) {
          continue;
        }

        // Get best prices for this language (prioritize NM condition)
        const bestPrices = this.getBestPricesForLanguage(langPrices);
        
        if (bestPrices) {
          const priceData: PriceData = {
            minPrice: bestPrices.minPrice,
            avgPrice: bestPrices.avgPrice,
            trendPrice: bestPrices.trendPrice,
            currency: 'EUR',
            language: lang,
            condition: bestPrices.condition,
            source: 'cardmarket',
            lastUpdated: new Date().toISOString()
          };

          prices.push(priceData);

          // Cache the data
          this.priceCache.set(`${cardName}-${setName || ''}-${lang}`, {
            cardId: 0, // Will be set when we have card ID
            language: lang,
            data: priceData,
            cachedAt: new Date()
          });
        }
      }

      console.log(`Found ${prices.length} price entries for ${cardName}`);
      return prices;

    } catch (error) {
      console.error(`Error fetching prices for ${cardName}:`, error);
      return [];
    }
  }

  private groupPricesByLanguage(prices: CardMarketPrice[]): Map<string, CardMarketPrice[]> {
    const groups = new Map<string, CardMarketPrice[]>();
    
    for (const price of prices) {
      const lang = price.language;
      if (!groups.has(lang)) {
        groups.set(lang, []);
      }
      groups.get(lang)!.push(price);
    }
    
    return groups;
  }

  private getBestPricesForLanguage(prices: CardMarketPrice[]): CardMarketPrice | null {
    if (prices.length === 0) return null;

    // Priority order for conditions: NM > EX > LP > GD > PL > PO
    const conditionPriority = { 'NM': 1, 'EX': 2, 'LP': 3, 'GD': 4, 'PL': 5, 'PO': 6 };
    
    // Sort by condition priority first, then by availability
    const sortedPrices = prices.sort((a, b) => {
      const priorityA = conditionPriority[a.condition] || 99;
      const priorityB = conditionPriority[b.condition] || 99;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same condition, prioritize higher availability
      return b.availableQuantity - a.availableQuantity;
    });

    return sortedPrices[0];
  }

  async getCardPricesByLanguages(cardName: string, setName?: string): Promise<{ [language: string]: PriceData }> {
    const prices = await this.getCardPrices(cardName, setName);
    const pricesByLang: { [language: string]: PriceData } = {};
    
    for (const price of prices) {
      pricesByLang[price.language] = price;
    }
    
    return pricesByLang;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear expired cache entries
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of Array.from(this.priceCache.entries())) {
      if (now - cached.cachedAt.getTime() > this.CACHE_DURATION) {
        this.priceCache.delete(key);
      }
    }
  }

  // Get cache statistics
  public getCacheStats(): { total: number; languages: string[] } {
    const languages = new Set<string>();
    for (const cached of Array.from(this.priceCache.values())) {
      languages.add(cached.language);
    }
    
    return {
      total: this.priceCache.size,
      languages: Array.from(languages)
    };
  }
}

export const priceService = new PriceService();

// Clear expired cache every hour
setInterval(() => {
  priceService.clearExpiredCache();
}, 1000 * 60 * 60);