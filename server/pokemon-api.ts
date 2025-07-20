// Pokemon TCG API integration
export interface PokemonTCGCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  rarity?: string;
  artist?: string;
  flavorText?: string;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    releaseDate: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      holofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
      normal?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
      reverseHolofoil?: {
        low: number;
        mid: number;
        high: number;
        market: number;
      };
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices?: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
    };
  };
}

export interface PokemonTCGResponse {
  data: PokemonTCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface PokemonTCGSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  images: {
    symbol: string;
    logo: string;
  };
}

const BASE_URL = 'https://api.pokemontcg.io/v2';
const HEADERS = {
  'Content-Type': 'application/json',
};

class PokemonTCGAPI {
  async getAllSets(): Promise<PokemonTCGSet[]> {
    console.log('Fetching all Pokemon TCG sets...');
    
    try {
      const response = await fetch(`${BASE_URL}/sets`, {
        headers: HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.data.length} sets`);
      return data.data;
    } catch (error) {
      console.error('Error fetching sets:', error);
      return [];
    }
  }

  async getCardsFromSet(setId: string, page = 1): Promise<PokemonTCGResponse> {
    console.log(`Fetching cards from set ${setId}, page ${page}...`);
    
    try {
      const response = await fetch(
        `${BASE_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=250`,
        {
          headers: HEADERS,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.data.length} cards on page ${page}`);
      return data;
    } catch (error) {
      console.error(`Error fetching cards from set ${setId}:`, error);
      return {
        data: [],
        page,
        pageSize: 250,
        count: 0,
        totalCount: 0,
      };
    }
  }

  async getAllCardsFromSet(setId: string): Promise<PokemonTCGCard[]> {
    console.log(`Fetching ALL cards from set ${setId}...`);
    const allCards: PokemonTCGCard[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await this.getCardsFromSet(setId, page);
      allCards.push(...response.data);
      
      hasMorePages = response.data.length === response.pageSize;
      page++;
      
      // Add a small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Total cards fetched from set ${setId}: ${allCards.length}`);
    return allCards;
  }

  async searchCards(query: string, page = 1): Promise<PokemonTCGResponse> {
    console.log(`Searching cards with query: ${query}, page ${page}...`);
    
    try {
      const response = await fetch(
        `${BASE_URL}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=250`,
        {
          headers: HEADERS,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.data.length} cards matching query`);
      return data;
    } catch (error) {
      console.error(`Error searching cards with query ${query}:`, error);
      return {
        data: [],
        page,
        pageSize: 250,
        count: 0,
        totalCount: 0,
      };
    }
  }

  async getPopularSets(): Promise<string[]> {
    // Return popular set IDs to prioritize
    return [
      'sv1', // Scarlet & Violet
      'sv2', // Paldea Evolved
      'sv3', // Obsidian Flames
      'sv4', // Paradox Rift
      'sv5', // Temporal Forces
      'swsh1', // Sword & Shield
      'swsh12', // Silver Tempest
      'swsh11', // Lost Origin
      'swsh10', // Astral Radiance
      'swsh9', // Brilliant Stars
    ];
  }

  async getAllCards(limit = 1000): Promise<PokemonTCGCard[]> {
    console.log('Fetching all Pokemon TCG cards...');
    
    try {
      const response = await fetch(
        `${BASE_URL}/cards?pageSize=${Math.min(limit, 250)}`,
        {
          headers: HEADERS,
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Found ${data.data.length} cards`);
      return data.data;
    } catch (error) {
      console.error('Error fetching all cards:', error);
      return [];
    }
  }
}

export const pokemonAPI = new PokemonTCGAPI();