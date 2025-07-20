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

  async getAllCards(): Promise<PokemonTCGCard[]> {
    console.log('Fetching ALL Pokemon TCG cards...');
    const allCards: PokemonTCGCard[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const response = await fetch(
          `${BASE_URL}/cards?page=${page}&pageSize=250`,
          {
            headers: HEADERS,
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched page ${page} with ${data.data.length} cards`);
        allCards.push(...data.data);
        
        // Check if we have more pages
        hasMorePages = data.data.length === 250; // If we got a full page, there might be more
        page++;
        
        // Add a small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Log progress every 10 pages
        if (page % 10 === 0) {
          console.log(`Progress: Fetched ${allCards.length} cards so far...`);
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break;
      }
    }

    console.log(`Total cards fetched: ${allCards.length}`);
    return allCards;
  }

  async getAllCardsFromAllSets(): Promise<PokemonTCGCard[]> {
    console.log('Fetching ALL cards from ALL sets...');
    
    // First get all sets
    const sets = await this.getAllSets();
    console.log(`Found ${sets.length} total sets`);
    
    const allCards: PokemonTCGCard[] = [];
    let setsProcessed = 0;
    
    for (const set of sets) {
      try {
        console.log(`Processing set ${set.id} (${set.name}) - ${setsProcessed + 1}/${sets.length}`);
        const setCards = await this.getAllCardsFromSet(set.id);
        allCards.push(...setCards);
        setsProcessed++;
        
        console.log(`Set ${set.id} complete: ${setCards.length} cards. Total so far: ${allCards.length}`);
        
        // Add delay between sets to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing set ${set.id}:`, error);
        continue; // Skip this set and continue with others
      }
    }

    console.log(`Completed! Total cards from all sets: ${allCards.length}`);
    return allCards;
  }
}

export const pokemonAPI = new PokemonTCGAPI();