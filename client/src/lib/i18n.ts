import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Function to detect user's country based on timezone and language
const detectUserCountry = (): string => {
  try {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Get browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';
    
    // Mapping of timezones to likely languages
    const timezoneToLanguage: Record<string, string> = {
      // European timezones
      'Europe/Rome': 'it',
      'Europe/Milan': 'it',
      'Europe/Paris': 'fr',
      'Europe/Berlin': 'de',
      'Europe/Munich': 'de',
      'Europe/Vienna': 'de',
      'Europe/Zurich': 'de',
      'Europe/Madrid': 'es',
      'Europe/Barcelona': 'es',
      'Europe/Lisbon': 'pt',
      'Europe/London': 'en',
      // Add more timezone mappings as needed
    };
    
    // Try timezone first
    if (timezoneToLanguage[timezone]) {
      return timezoneToLanguage[timezone];
    }
    
    // Fallback to browser language
    const langCode = browserLang.split('-')[0].toLowerCase();
    const supportedLanguages = ['en', 'it', 'fr', 'de', 'es', 'pt'];
    
    if (supportedLanguages.includes(langCode)) {
      return langCode;
    }
    
    // Default fallback
    return 'en';
  } catch (error) {
    console.log('Language detection failed, using English as default');
    return 'en';
  }
};

// Function to get user's location via IP (using a free service)
const detectLocationByIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code?.toLowerCase();
      
      // Map country codes to languages
      const countryToLanguage: Record<string, string> = {
        'it': 'it', // Italy
        'fr': 'fr', // France
        'de': 'de', // Germany
        'at': 'de', // Austria
        'ch': 'de', // Switzerland (default to German, though it's multilingual)
        'es': 'es', // Spain
        'pt': 'pt', // Portugal
        'br': 'pt', // Brazil
        'gb': 'en', // United Kingdom
        'us': 'en', // United States
        'ca': 'en', // Canada (default to English)
        'au': 'en', // Australia
      };
      
      return countryToLanguage[countryCode] || 'en';
    }
  } catch (error) {
    console.log('IP-based location detection failed');
  }
  
  return detectUserCountry(); // Fallback to timezone/browser detection
};

const resources = {
  en: {
    translation: {
      // Header
      home: 'Home',
      news: 'News',
      database: 'Database',
      collection: 'My Collection',
      login: 'Login',
      
      // Hero
      heroTitle: 'The Ultimate Pokemon Card Collection Hub',
      heroSubtitle: 'Track your collection, discover new cards, and stay updated with the latest Pokemon TCG news and prices.',
      exploreDatabase: 'Explore Database',
      startCollection: 'Start Collection',
      
      // Stats
      pokemonCards: 'Pokemon Cards',
      setsExpansions: 'Sets & Expansions',
      activeCollectors: 'Active Collectors',
      supportedLanguages: 'Supported Languages',
      
      // News
      latestNews: 'Latest News & Content',
      viewAllNews: 'View All News',
      readMore: 'Read More',
      
      // Database
      pokemonCardDatabase: 'Pokemon Card Database',
      chooseLanguage: 'Choose Your Language',
      selectPreferredLanguage: 'Select your preferred language to view cards and content',
      searchPlaceholder: 'Search cards, sets, or products...',
      searchCards: 'Search cards...',
      allSets: 'All Sets',
      allLanguages: 'All Languages',
      allTypes: 'All Types',
      back: 'Back',
      chooseExpansion: 'Choose Expansion',
      selectExpansionDescription: 'Select a Pokemon card expansion to explore',
      chooseProductType: 'Choose Product Type',
      singleCards: 'Single Cards',
      singleCardsDescription: 'Individual Pokemon cards from this expansion',
      products: 'Products',
      productsDescription: 'Booster packs, ETBs, tins, and special collections',
      boosterPacks: 'Booster Packs',
      eliteTrainerBox: 'Elite Trainer Box',
      bundleSets: 'Bundle Sets',
      popular: 'Popular',
      rareCards: 'Rare Cards',
      priceTrending: 'Price Trending',
      recentlyAdded: 'Recently Added',
      minPrice: 'Min Price',
      add: 'Add',
      
      // Collection
      myCollection: 'My Collection',
      totalCards: 'Total Cards',
      collectionValue: 'Collection Value',
      completionRate: 'Completion Rate',
      bySet: 'By Set',
      byType: 'By Type',
      wishlist: 'Wishlist',
      analytics: 'Analytics',
      complete: 'Complete',
      owned: 'Owned',
      missing: 'Missing',
      value: 'Value',
      
      // Footer
      features: 'Features',
      cardDatabase: 'Card Database',
      collectionTracking: 'Collection Tracking',
      priceComparison: 'Price Comparison',
      newsUpdates: 'News & Updates',
      support: 'Support',
      helpCenter: 'Help Center',
      contactUs: 'Contact Us',
      apiDocumentation: 'API Documentation',
      community: 'Community',
      newsletter: 'Newsletter',
      newsletterText: 'Stay updated with the latest Pokemon TCG news and market trends.',
      yourEmail: 'Your email',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    }
  },
  it: {
    translation: {
      // Header
      home: 'Home',
      news: 'Notizie',
      database: 'Database',
      collection: 'La Mia Collezione',
      login: 'Accedi',
      
      // Hero
      heroTitle: 'La Piattaforma Definitiva per Collezionisti Pokemon',
      heroSubtitle: 'Traccia la tua collezione, scopri nuove carte e rimani aggiornato con le ultime notizie e prezzi del TCG Pokemon.',
      exploreDatabase: 'Esplora Database',
      startCollection: 'Inizia Collezione',
      
      // Stats
      pokemonCards: 'Carte Pokemon',
      setsExpansions: 'Set ed Espansioni',
      activeCollectors: 'Collezionisti Attivi',
      supportedLanguages: 'Lingue Supportate',
      
      // News
      latestNews: 'Ultime Notizie e Contenuti',
      viewAllNews: 'Vedi Tutte le Notizie',
      readMore: 'Leggi di Più',
      
      // Database
      pokemonCardDatabase: 'Database Carte Pokemon',
      chooseLanguage: 'Scegli la Tua Lingua',
      selectPreferredLanguage: 'Seleziona la tua lingua preferita per visualizzare carte e contenuti',
      searchPlaceholder: 'Cerca carte, set o prodotti...',
      searchCards: 'Cerca carte...',
      allSets: 'Tutti i Set',
      allLanguages: 'Tutte le Lingue',
      allTypes: 'Tutti i Tipi',
      back: 'Indietro',
      chooseExpansion: 'Scegli Espansione',
      selectExpansionDescription: 'Seleziona un\'espansione di carte Pokémon da esplorare',
      chooseProductType: 'Scegli Tipo di Prodotto',
      singleCards: 'Carte Singole',
      singleCardsDescription: 'Carte Pokémon individuali di questa espansione',
      products: 'Prodotti',
      productsDescription: 'Buste, ETB, tin e collezioni speciali',
      boosterPacks: 'Buste',
      eliteTrainerBox: 'Elite Trainer Box',
      bundleSets: 'Set Bundle',
      popular: 'Popolari',
      rareCards: 'Carte Rare',
      priceTrending: 'Prezzi in Tendenza',
      recentlyAdded: 'Aggiunte di Recente',
      minPrice: 'Prezzo Min',
      add: 'Aggiungi',
      
      // Collection
      myCollection: 'La Mia Collezione',
      totalCards: 'Carte Totali',
      collectionValue: 'Valore Collezione',
      completionRate: 'Tasso di Completamento',
      bySet: 'Per Set',
      byType: 'Per Tipo',
      wishlist: 'Lista Desideri',
      analytics: 'Analisi',
      complete: 'Completo',
      owned: 'Possedute',
      missing: 'Mancanti',
      value: 'Valore',
      
      // Footer
      features: 'Funzionalità',
      cardDatabase: 'Database Carte',
      collectionTracking: 'Tracciamento Collezione',
      priceComparison: 'Confronto Prezzi',
      newsUpdates: 'Notizie e Aggiornamenti',
      support: 'Supporto',
      helpCenter: 'Centro Assistenza',
      contactUs: 'Contattaci',
      apiDocumentation: 'Documentazione API',
      community: 'Comunità',
      newsletter: 'Newsletter',
      newsletterText: 'Rimani aggiornato con le ultime notizie e tendenze del mercato Pokemon TCG.',
      yourEmail: 'La tua email',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Termini di Servizio',
    }
  }
};

// Initialize i18n with automatic language detection
const initializeI18n = async () => {
  let detectedLanguage = 'en';
  
  // Try to get language from localStorage first
  const savedLanguage = localStorage.getItem('preferred-language');
  if (savedLanguage && ['en', 'it', 'fr', 'de', 'es', 'pt'].includes(savedLanguage)) {
    detectedLanguage = savedLanguage;
  } else {
    // Try IP-based detection, with fallback to timezone/browser detection
    try {
      detectedLanguage = await detectLocationByIP();
      console.log(`Auto-detected language: ${detectedLanguage}`);
    } catch (error) {
      detectedLanguage = detectUserCountry();
      console.log(`Fallback language detection: ${detectedLanguage}`);
    }
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: detectedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  // Save the detected language to localStorage
  localStorage.setItem('preferred-language', detectedLanguage);
  
  // Listen for language changes and save them
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('preferred-language', lng);
  });
};

// Initialize i18n
initializeI18n().catch(console.error);

export default i18n;
