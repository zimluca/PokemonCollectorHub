// TCGdx API integration for multilingual Pokemon cards
// https://api.tcgdx.net/v2/

export const SUPPORTED_LANGUAGES = {
  en: 'en',
  it: 'it', 
  fr: 'fr',
  de: 'de',
  es: 'es',
  pt: 'pt',
  nl: 'nl'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export interface TCGdxCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category: string;
  illustrator?: string;
  rarity: {
    name: string;
  };
  set: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
    releaseDate?: string;
    cardCount: {
      total: number;
      official: number;
    };
  };
  variants?: {
    normal?: boolean;
    reverse?: boolean;
    holo?: boolean;
    firstEdition?: boolean;
  };
  hp?: number;
  types?: string[];
  stage?: string;
  suffix?: string;
  item?: {
    name: string;
  };
  abilities?: Array<{
    type: string;
    name: string;
    effect: string;
  }>;
  attacks?: Array<{
    name: string;
    effect?: string;
    damage?: string;
    cost?: string[];
  }>;
  weaknesses?: Array<{
    type: string;
    value?: string;
  }>;
  resistances?: Array<{
    type: string;
    value?: string;
  }>;
  retreat?: number;
  legal: {
    standard: boolean;
    expanded: boolean;
  };
}

export interface TCGdxSet {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  releaseDate: string;
  cardCount: {
    total: number;
    official: number;
  };
  series: {
    id: string;
    name: string;
  };
}

export interface TCGdxResponse<T> {
  data: T[];
  pagination?: {
    count: number;
    totalCount: number;
    page: number;
    totalPages: number;
  };
}

const BASE_URL = 'https://api.tcgdx.net/v2';

class TCGdxAPI {
  private async fetchWithLanguage<T>(endpoint: string, language: SupportedLanguage = 'en'): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Accept-Language': language,
      'Content-Type': 'application/json',
    };

    console.log(`Fetching from TCGdx: ${url} (language: ${language})`);
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`TCGdx API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAllSets(language: SupportedLanguage = 'en'): Promise<TCGdxSet[]> {
    const response = await this.fetchWithLanguage<TCGdxSet[]>('/sets', language);
    return Array.isArray(response) ? response : [];
  }

  async getCardsFromSet(setId: string, language: SupportedLanguage = 'en'): Promise<TCGdxCard[]> {
    const response = await this.fetchWithLanguage<TCGdxCard[]>(`/sets/${setId}/cards`, language);
    return Array.isArray(response) ? response : [];
  }

  async getCard(setId: string, cardId: string, language: SupportedLanguage = 'en'): Promise<TCGdxCard | null> {
    try {
      const card = await this.fetchWithLanguage<TCGdxCard>(`/sets/${setId}/cards/${cardId}`, language);
      return card;
    } catch (error) {
      console.error(`Error fetching card ${cardId} from set ${setId} in ${language}:`, error);
      return null;
    }
  }

  // Get multilingual data for a specific card
  async getCardMultilingual(setId: string, cardId: string): Promise<Record<SupportedLanguage, TCGdxCard | null>> {
    const results: Record<SupportedLanguage, TCGdxCard | null> = {} as any;
    
    for (const [langKey, langCode] of Object.entries(SUPPORTED_LANGUAGES)) {
      try {
        results[langKey as SupportedLanguage] = await this.getCard(setId, cardId, langCode as SupportedLanguage);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to fetch card ${cardId} in ${langKey}:`, error);
        results[langKey as SupportedLanguage] = null;
      }
    }
    
    return results;
  }

  // Get multilingual data for all cards in a set
  async getSetMultilingual(setId: string): Promise<Record<SupportedLanguage, TCGdxCard[]>> {
    const results: Record<SupportedLanguage, TCGdxCard[]> = {} as any;
    
    for (const [langKey, langCode] of Object.entries(SUPPORTED_LANGUAGES)) {
      try {
        console.log(`Fetching set ${setId} in ${langKey}...`);
        results[langKey as SupportedLanguage] = await this.getCardsFromSet(setId, langCode as SupportedLanguage);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to fetch set ${setId} in ${langKey}:`, error);
        results[langKey as SupportedLanguage] = [];
      }
    }
    
    return results;
  }
}

export const tcgdxAPI = new TCGdxAPI();