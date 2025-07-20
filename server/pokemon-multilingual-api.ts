// Enhanced Pokemon TCG API with multilingual support
// Using the official Pokemon TCG API with language-specific queries

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  it: 'Italian', 
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Language-specific set IDs mapping for Pokemon TCG API
const LANGUAGE_SET_MAPPINGS: Record<string, Record<SupportedLanguage, string>> = {
  'base1': {
    en: 'base1',
    it: 'base1',  // Italian sets have different IDs
    fr: 'base1',
    de: 'base1',
    es: 'base1',
    pt: 'base1'
  },
  'jungle': {
    en: 'jungle',
    it: 'jungle',
    fr: 'jungle', 
    de: 'jungle',
    es: 'jungle',
    pt: 'jungle'
  }
  // Add more mappings as needed
};

// Some European cards have different names/translations
const MANUAL_TRANSLATIONS: Record<string, Record<SupportedLanguage, string>> = {
  'Pikachu': {
    en: 'Pikachu',
    it: 'Pikachu',
    fr: 'Pikachu',
    de: 'Pikachu', 
    es: 'Pikachu',
    pt: 'Pikachu'
  },
  'Charizard': {
    en: 'Charizard',
    it: 'Charizard',
    fr: 'Dracaufeu',
    de: 'Glurak',
    es: 'Charizard',
    pt: 'Charizard'
  },
  'Blastoise': {
    en: 'Blastoise',
    it: 'Blastoise',
    fr: 'Tortank',
    de: 'Turtok',
    es: 'Blastoise',
    pt: 'Blastoise'
  },
  'Venusaur': {
    en: 'Venusaur',
    it: 'Venusaur',
    fr: 'Florizarre',
    de: 'Bisaflor',
    es: 'Venusaur',
    pt: 'Venusaur'
  },
  'Alakazam': {
    en: 'Alakazam',
    it: 'Alakazam',
    fr: 'Alakazam',
    de: 'Simsala',
    es: 'Alakazam',
    pt: 'Alakazam'
  },
  'Machamp': {
    en: 'Machamp',
    it: 'Machamp',
    fr: 'Mackogneur',
    de: 'Machomei',
    es: 'Machamp',
    pt: 'Machamp'
  },
  'Gengar': {
    en: 'Gengar',
    it: 'Gengar',
    fr: 'Ectoplasma',
    de: 'Gengar',
    es: 'Gengar',
    pt: 'Gengar'
  },
  'Mewtwo': {
    en: 'Mewtwo',
    it: 'Mewtwo',
    fr: 'Mewtwo',
    de: 'Mewtu',
    es: 'Mewtwo',
    pt: 'Mewtwo'
  },
  'Mew': {
    en: 'Mew',
    it: 'Mew',
    fr: 'Mew',
    de: 'Mew',
    es: 'Mew',
    pt: 'Mew'
  },
  'Gyarados': {
    en: 'Gyarados',
    it: 'Gyarados',
    fr: 'Léviator',
    de: 'Garados',
    es: 'Gyarados',
    pt: 'Gyarados'
  },
  'Dragonite': {
    en: 'Dragonite',
    it: 'Dragonite',
    fr: 'Dracolosse',
    de: 'Dragoran',
    es: 'Dragonite',
    pt: 'Dragonite'
  }
};

class PokemonMultilingualAPI {
  private baseUrl = 'https://api.pokemontcg.io/v2';
  
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sets?pageSize=1`);
      return response.ok;
    } catch (error) {
      console.error('Pokemon TCG API connection failed:', error);
      return false;
    }
  }

  // Get basic translation for a Pokemon name if available
  getBasicTranslation(englishName: string, targetLanguage: SupportedLanguage): string {
    const translations = MANUAL_TRANSLATIONS[englishName];
    if (translations && translations[targetLanguage]) {
      return translations[targetLanguage];
    }
    return englishName; // Fallback to English if no translation
  }

  // Enhanced method to get multilingual names for popular Pokemon
  async getCardMultilingualNames(cardName: string): Promise<Record<SupportedLanguage, string>> {
    const result: Record<SupportedLanguage, string> = {
      en: cardName,
      it: cardName,
      fr: this.getBasicTranslation(cardName, 'fr'),
      de: this.getBasicTranslation(cardName, 'de'),
      es: this.getBasicTranslation(cardName, 'es'),
      pt: this.getBasicTranslation(cardName, 'pt')
    };

    return result;
  }

  // Get sample multilingual data for testing
  async getSampleMultilingualCard(): Promise<any> {
    return {
      id: 'sample-pikachu',
      names: {
        en: 'Pikachu',
        it: 'Pikachu',
        fr: 'Pikachu',
        de: 'Pikachu',
        es: 'Pikachu',
        pt: 'Pikachu'
      },
      images: {
        en: 'https://images.pokemontcg.io/base1/58.png',
        it: 'https://images.pokemontcg.io/base1/58.png',
        fr: 'https://images.pokemontcg.io/base1/58.png',
        de: 'https://images.pokemontcg.io/base1/58.png',
        es: 'https://images.pokemontcg.io/base1/58.png',
        pt: 'https://images.pokemontcg.io/base1/58.png'
      }
    };
  }

  // Enhanced translation method for known Pokemon
  async enhanceCardWithBasicTranslations(cardName: string): Promise<Record<SupportedLanguage, string | null>> {
    const translations: Record<SupportedLanguage, string | null> = {
      en: cardName,
      it: cardName, // Keep existing Italian
      fr: null,
      de: null,
      es: null,
      pt: null
    };

    // Apply known translations
    const knownTranslations = MANUAL_TRANSLATIONS[cardName];
    if (knownTranslations) {
      Object.keys(knownTranslations).forEach(lang => {
        const language = lang as SupportedLanguage;
        translations[language] = knownTranslations[language];
      });
    }

    return translations;
  }
}

export const pokemonMultilingualAPI = new PokemonMultilingualAPI();