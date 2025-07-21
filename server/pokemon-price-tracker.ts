import type { Product } from "@shared/schema";

interface PokemonPriceTrackerPrice {
  name: string;
  setId: string;
  id: string;
  number: string;
  tcgplayer?: {
    prices: {
      normal?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
      holofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
    };
  };
  cardmarket?: {
    prices: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
    };
  };
  ebay?: {
    prices: Record<string, {
      price: number;
      count: number;
    }>;
  };
}

interface PokemonPriceTrackerResponse {
  data: PokemonPriceTrackerPrice[];
  meta: {
    totalCount: number;
    page: number;
    limit: number;
  };
}

class PokemonPriceTrackerService {
  private baseUrl = "https://www.pokemonpricetracker.com/api/v1";
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.POKEMON_PRICE_TRACKER_API_KEY || null;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error("POKEMON_PRICE_TRACKER_API_KEY non configurata");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  async getCardPrices(params: {
    name?: string;
    setId?: string;
    id?: string;
    limit?: number;
  }): Promise<PokemonPriceTrackerResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append("name", params.name);
    if (params.setId) queryParams.append("setId", params.setId);
    if (params.id) queryParams.append("id", params.id);
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/prices?${queryParams.toString()}`;
    return this.makeRequest<PokemonPriceTrackerResponse>(endpoint);
  }

  async getCardPriceById(cardId: string): Promise<PokemonPriceTrackerPrice | null> {
    try {
      const response = await this.getCardPrices({ id: cardId });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(`Errore recupero prezzo per carta ${cardId}:`, error);
      return null;
    }
  }

  // Funzione per mappare i nostri prodotti ai prezzi di PokemonPriceTracker
  async enrichProductWithPrices(product: Product): Promise<Product & { priceData?: any }> {
    try {
      let priceData: PokemonPriceTrackerPrice | null = null;

      // Prima prova con tcgId se esiste
      if (product.tcgId) {
        priceData = await this.getCardPriceById(product.tcgId);
      }

      // Se non trova nulla, prova con nome e set
      if (!priceData && product.name && product.setId) {
        const response = await this.getCardPrices({
          name: product.name,
          setId: product.setId,
          limit: 1
        });
        priceData = response.data.length > 0 ? response.data[0] : null;
      }

      return {
        ...product,
        priceData: priceData ? {
          tcgplayer: priceData.tcgplayer?.prices,
          cardmarket: priceData.cardmarket?.prices,
          ebay: priceData.ebay?.prices
        } : null
      };
    } catch (error) {
      console.error(`Errore arricchimento prezzi per prodotto ${product.id}:`, error);
      return product;
    }
  }

  // Funzione per ottenere il prezzo minimo di una carta
  getMinPrice(priceData: any): number | null {
    if (!priceData) return null;

    const prices: number[] = [];

    // TCGPlayer prezzi
    if (priceData.tcgplayer) {
      const tcg = priceData.tcgplayer;
      if (tcg.normal?.low) prices.push(tcg.normal.low);
      if (tcg.holofoil?.low) prices.push(tcg.holofoil.low);
    }

    // CardMarket prezzi
    if (priceData.cardmarket) {
      const cm = priceData.cardmarket;
      if (cm.lowPrice) prices.push(cm.lowPrice);
    }

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  // Funzione per ottenere il prezzo medio di una carta
  getAveragePrice(priceData: any): number | null {
    if (!priceData) return null;

    const prices: number[] = [];

    // TCGPlayer prezzi medi
    if (priceData.tcgplayer) {
      const tcg = priceData.tcgplayer;
      if (tcg.normal?.mid) prices.push(tcg.normal.mid);
      if (tcg.holofoil?.mid) prices.push(tcg.holofoil.mid);
    }

    // CardMarket prezzo medio
    if (priceData.cardmarket) {
      const cm = priceData.cardmarket;
      if (cm.averageSellPrice) prices.push(cm.averageSellPrice);
    }

    return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
  }

  // Funzione per ottenere il prezzo di tendenza di una carta
  getTrendPrice(priceData: any): number | null {
    if (!priceData) return null;

    const prices: number[] = [];

    // TCGPlayer prezzi di mercato
    if (priceData.tcgplayer) {
      const tcg = priceData.tcgplayer;
      if (tcg.normal?.market) prices.push(tcg.normal.market);
      if (tcg.holofoil?.market) prices.push(tcg.holofoil.market);
    }

    // CardMarket prezzo di tendenza
    if (priceData.cardmarket) {
      const cm = priceData.cardmarket;
      if (cm.trendPrice) prices.push(cm.trendPrice);
    }

    return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
  }
}

export const pokemonPriceTracker = new PokemonPriceTrackerService();