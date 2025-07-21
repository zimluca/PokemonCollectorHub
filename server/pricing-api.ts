import { z } from 'zod';

// Pokemon TCG API pricing schema
const PokemonTCGPriceSchema = z.object({
  low: z.number().optional(),
  mid: z.number().optional(),  
  high: z.number().optional(),
  market: z.number().optional(),
  directLow: z.number().optional(),
});

const PokemonTCGCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  tcgplayer: z.object({
    url: z.string().optional(),
    updatedAt: z.string().optional(),
    prices: z.record(PokemonTCGPriceSchema).optional(),
  }).optional(),
  cardmarket: z.object({
    url: z.string().optional(),
    updatedAt: z.string().optional(),
    prices: z.object({
      averageSellPrice: z.number().optional(),
      lowPrice: z.number().optional(),
      trendPrice: z.number().optional(),
      germanProLow: z.number().optional(),
      suggestedPrice: z.number().optional(),
      reverseHoloSell: z.number().optional(),
      reverseHoloLow: z.number().optional(),
      reverseHoloTrend: z.number().optional(),
      lowPriceExPlus: z.number().optional(),
      avg1: z.number().optional(),
      avg7: z.number().optional(),
      avg30: z.number().optional(),
      reverseHoloAvg1: z.number().optional(),
      reverseHoloAvg7: z.number().optional(),
      reverseHoloAvg30: z.number().optional(),
    }).optional(),
  }).optional(),
});

export interface PriceData {
  lowPrice?: number;
  avgPrice?: number;
  highPrice?: number;
  trendPrice?: number;
  marketPrice?: number;
  source: string;
  updatedAt: Date;
  currency: string;
}

export class PricingService {
  private pokemonTcgApiKey?: string;
  private justTcgApiKey?: string;

  constructor() {
    this.pokemonTcgApiKey = process.env.POKEMON_TCG_API_KEY;
    this.justTcgApiKey = process.env.JUSTTCG_API_KEY;
  }

  /**
   * Get pricing data from Pokemon TCG API (free, includes some price data)
   */
  async getPokemonTCGPrice(cardId: string): Promise<PriceData | null> {
    try {
      const headers: Record<string, string> = {};
      if (this.pokemonTcgApiKey) {
        headers['X-Api-Key'] = this.pokemonTcgApiKey;
      }

      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards/${cardId}`,
        { headers }
      );

      if (!response.ok) {
        console.log(`Pokemon TCG API error for ${cardId}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const card = PokemonTCGCardSchema.parse(data.data);

      let priceData: PriceData = {
        source: 'pokemontcg',
        updatedAt: new Date(),
        currency: 'USD',
      };

      // Try TCGPlayer prices first
      if (card.tcgplayer?.prices) {
        const prices = card.tcgplayer.prices;
        const normalPrices = prices.normal || prices.holofoil || prices.reverseHolofoil || prices['1stEditionHolofoil'];
        
        if (normalPrices) {
          priceData.lowPrice = normalPrices.low;
          priceData.avgPrice = normalPrices.mid;
          priceData.highPrice = normalPrices.high;
          priceData.marketPrice = normalPrices.market;
        }
      }

      // Fallback to Cardmarket prices (EUR)
      if (card.cardmarket?.prices && !priceData.lowPrice) {
        const cmPrices = card.cardmarket.prices;
        priceData.lowPrice = cmPrices.lowPrice;
        priceData.avgPrice = cmPrices.averageSellPrice;
        priceData.trendPrice = cmPrices.trendPrice;
        priceData.currency = 'EUR';
      }

      // Only return if we have at least one price
      if (priceData.lowPrice || priceData.avgPrice || priceData.trendPrice) {
        return priceData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Pokemon TCG price for ${cardId}:`, error);
      return null;
    }
  }

  /**
   * Get pricing data from JustTCG (paid service, more comprehensive)
   */
  async getJustTCGPrice(cardName: string, setName: string): Promise<PriceData | null> {
    if (!this.justTcgApiKey) {
      console.log('JustTCG API key not configured');
      return null;
    }

    try {
      // This is a placeholder - actual JustTCG API implementation would go here
      // Based on their documentation when available
      const response = await fetch(
        `https://api.justtcg.com/v1/pokemon/cards/search?name=${encodeURIComponent(cardName)}&set=${encodeURIComponent(setName)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.justTcgApiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Parse JustTCG response format (to be implemented based on their docs)
      return {
        lowPrice: data.prices?.low,
        avgPrice: data.prices?.average,
        highPrice: data.prices?.high,
        trendPrice: data.prices?.trend,
        marketPrice: data.prices?.market,
        source: 'justtcg',
        updatedAt: new Date(data.updated_at),
        currency: 'USD',
      };
    } catch (error) {
      console.error(`Error fetching JustTCG price for ${cardName}:`, error);
      return null;
    }
  }

  /**
   * Get best available price data by trying multiple sources
   */
  async getBestPriceData(cardId: string, cardName: string, setName: string): Promise<PriceData | null> {
    // Try Pokemon TCG API first (free)
    if (cardId) {
      const pokemonTcgPrice = await this.getPokemonTCGPrice(cardId);
      if (pokemonTcgPrice) {
        return pokemonTcgPrice;
      }
    }

    // Try JustTCG as fallback (paid)
    if (cardName && setName) {
      const justTcgPrice = await this.getJustTCGPrice(cardName, setName);
      if (justTcgPrice) {
        return justTcgPrice;
      }
    }

    return null;
  }

  /**
   * Batch update prices for multiple cards
   */
  async batchUpdatePrices(cards: Array<{
    id: number;
    tcgId?: string;
    name: string;
    setName?: string;
  }>): Promise<Array<{cardId: number; priceData: PriceData | null}>> {
    const results = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (card) => {
        const priceData = await this.getBestPriceData(
          card.tcgId || '',
          card.name,
          card.setName || ''
        );
        
        return {
          cardId: card.id,
          priceData
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + batchSize < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Manual price setting for cards without API data
   */
  createManualPrice(prices: {
    lowPrice?: number;
    avgPrice?: number;
    highPrice?: number;
    trendPrice?: number;
    currency?: string;
  }): PriceData {
    return {
      lowPrice: prices.lowPrice,
      avgPrice: prices.avgPrice,
      highPrice: prices.highPrice,
      trendPrice: prices.trendPrice,
      marketPrice: prices.avgPrice, // Use avg as market price fallback
      source: 'manual',
      updatedAt: new Date(),
      currency: prices.currency || 'EUR',
    };
  }
}

export const pricingService = new PricingService();